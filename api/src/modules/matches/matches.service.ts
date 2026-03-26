import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateMatchDto, ConfirmMatchDto, CreateEventDto } from './dto';
import { EventType, MatchStatus, ConfirmationStatus } from '@prisma/client';

interface DraftPlayer {
  id: string;
  overall: number;
  primaryPosition: string | null;
  isGoalkeeper: boolean;
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, groupId: string, dto: CreateMatchDto) {
    const member = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!member || !member.isActive) {
      throw new ForbiddenException('Você não é membro deste grupo');
    }

    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    return this.prisma.match.create({
      data: {
        groupId,
        title: dto.title,
        location: dto.location || group.defaultLocation,
        scheduledAt: new Date(dto.scheduledAt),
        playerLimit: dto.playerLimit || group.playerLimit,
        goalkeeperLimit: dto.goalkeeperLimit || group.goalkeeperLimit,
        notes: dto.notes,
      },
    });
  }

  async findByGroup(groupId: string) {
    return this.prisma.match.findMany({
      where: { groupId },
      include: {
        _count: { select: { confirmations: true, teams: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findById(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        confirmations: {
          include: {
            player: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        teams: {
          include: {
            players: {
              include: {
                player: {
                  include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          include: {
            player: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        waitingList: {
          orderBy: { position: 'asc' },
          include: {
            player: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        awards: {
          include: {
            player: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        group: { select: { id: true, name: true } },
      },
    });

    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    return match;
  }

  async confirm(userId: string, matchId: string, dto: ConfirmMatchDto) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    if (match.status === 'FINISHED' || match.status === 'CANCELLED') {
      throw new BadRequestException('Partida já encerrada ou cancelada');
    }

    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    const confirmationStatus = dto.status as ConfirmationStatus;

    const existing = await this.prisma.matchConfirmation.findUnique({
      where: { matchId_playerId: { matchId, playerId: profile.id } },
    });

    if (existing) {
      return this.prisma.matchConfirmation.update({
        where: { id: existing.id },
        data: {
          status: confirmationStatus,
          isGoalkeeper: dto.isGoalkeeper ?? existing.isGoalkeeper,
          confirmedAt: confirmationStatus === 'CONFIRMED' ? new Date() : null,
        },
      });
    }

    if (confirmationStatus === 'CONFIRMED') {
      const confirmedCount = await this.prisma.matchConfirmation.count({
        where: { matchId, status: 'CONFIRMED' },
      });

      if (confirmedCount >= match.playerLimit) {
        await this.prisma.matchConfirmation.create({
          data: {
            matchId,
            playerId: profile.id,
            status: 'WAITLISTED',
            isGoalkeeper: dto.isGoalkeeper ?? false,
          },
        });

        const lastPosition = await this.prisma.waitingListEntry.findFirst({
          where: { matchId },
          orderBy: { position: 'desc' },
        });

        return this.prisma.waitingListEntry.create({
          data: {
            matchId,
            playerId: profile.id,
            position: (lastPosition?.position ?? 0) + 1,
          },
        });
      }
    }

    return this.prisma.matchConfirmation.create({
      data: {
        matchId,
        playerId: profile.id,
        status: confirmationStatus,
        isGoalkeeper: dto.isGoalkeeper ?? false,
        confirmedAt: confirmationStatus === 'CONFIRMED' ? new Date() : null,
      },
    });
  }

  async executeDraft(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        confirmations: {
          where: { status: 'CONFIRMED' },
          include: { player: true },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    const allowedStatuses: MatchStatus[] = ['SCHEDULED', 'CONFIRMING', 'DRAFT_READY'];
    if (!allowedStatuses.includes(match.status)) {
      throw new BadRequestException('Status da partida não permite sorteio');
    }

    const confirmedPlayers: DraftPlayer[] = match.confirmations.map((c) => ({
      id: c.player.id,
      overall: c.player.overall,
      primaryPosition: c.player.primaryPosition,
      isGoalkeeper: c.isGoalkeeper,
    }));

    if (confirmedPlayers.length < 4) {
      throw new BadRequestException('Mínimo de 4 jogadores confirmados para o sorteio');
    }

    await this.prisma.team.deleteMany({ where: { matchId } });

    const { teamA, teamB } = this.balancedDraft(confirmedPlayers);

    const [createdTeamA, createdTeamB] = await Promise.all([
      this.prisma.team.create({
        data: {
          matchId,
          name: 'Time A',
          color: '#3B82F6',
          round: match.currentRound,
          players: {
            create: teamA.map((p, i) => ({
              playerId: p.id,
              position: p.primaryPosition || undefined,
              isCaptain: i === 0,
            })),
          },
        },
        include: {
          players: {
            include: {
              player: {
                include: { user: { select: { id: true, name: true } } },
              },
            },
          },
        },
      }),
      this.prisma.team.create({
        data: {
          matchId,
          name: 'Time B',
          color: '#EF4444',
          round: match.currentRound,
          players: {
            create: teamB.map((p, i) => ({
              playerId: p.id,
              position: p.primaryPosition || undefined,
              isCaptain: i === 0,
            })),
          },
        },
        include: {
          players: {
            include: {
              player: {
                include: { user: { select: { id: true, name: true } } },
              },
            },
          },
        },
      }),
    ]);

    await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'DRAFTING' },
    });

    const overallA = teamA.reduce((sum, p) => sum + p.overall, 0) / teamA.length;
    const overallB = teamB.reduce((sum, p) => sum + p.overall, 0) / teamB.length;

    return {
      teamA: createdTeamA,
      teamB: createdTeamB,
      balance: {
        teamAAvg: Math.round(overallA * 100) / 100,
        teamBAvg: Math.round(overallB * 100) / 100,
        diff: Math.round(Math.abs(overallA - overallB) * 100) / 100,
      },
    };
  }

  /**
   * Snake draft balanceado: separa goleiros, ordena por overall,
   * distribui em serpentina (A-B-B-A-A-B...) garantindo equilíbrio.
   */
  private balancedDraft(players: DraftPlayer[]) {
    const goalkeepers = players.filter((p) => p.isGoalkeeper);
    const fieldPlayers = players.filter((p) => !p.isGoalkeeper);

    goalkeepers.sort((a, b) => b.overall - a.overall);
    fieldPlayers.sort((a, b) => b.overall - a.overall);

    const teamA: DraftPlayer[] = [];
    const teamB: DraftPlayer[] = [];

    for (let i = 0; i < goalkeepers.length; i++) {
      if (i % 2 === 0) {
        teamA.push(goalkeepers[i]);
      } else {
        teamB.push(goalkeepers[i]);
      }
    }

    const positionGroups = new Map<string, DraftPlayer[]>();
    for (const player of fieldPlayers) {
      const pos = player.primaryPosition || 'UNKNOWN';
      const group = positionGroups.get(pos) || [];
      group.push(player);
      positionGroups.set(pos, group);
    }

    const positionOrder = ['ZAG', 'LAT', 'VOL', 'MEI', 'ATA', 'UNKNOWN'];
    const sortedFieldPlayers: DraftPlayer[] = [];

    for (const pos of positionOrder) {
      const group = positionGroups.get(pos) || [];
      group.sort((a, b) => b.overall - a.overall);

      for (let i = 0; i < group.length; i += 2) {
        sortedFieldPlayers.push(group[i]);
        if (i + 1 < group.length) {
          sortedFieldPlayers.push(group[i + 1]);
        }
      }
    }

    for (let i = 0; i < sortedFieldPlayers.length; i++) {
      const round = Math.floor(i / 2);
      const pick = i % 2;

      if (round % 2 === 0) {
        if (pick === 0) teamA.push(sortedFieldPlayers[i]);
        else teamB.push(sortedFieldPlayers[i]);
      } else {
        if (pick === 0) teamB.push(sortedFieldPlayers[i]);
        else teamA.push(sortedFieldPlayers[i]);
      }
    }

    const sumA = teamA.reduce((s, p) => s + p.overall, 0);
    const sumB = teamB.reduce((s, p) => s + p.overall, 0);

    if (Math.abs(sumA - sumB) > 2 && teamA.length > 1 && teamB.length > 1) {
      const stronger = sumA > sumB ? teamA : teamB;
      const weaker = sumA > sumB ? teamB : teamA;

      let bestDiff = Math.abs(sumA - sumB);
      let bestSwap: [number, number] | null = null;

      for (let i = 0; i < stronger.length; i++) {
        if (stronger[i].isGoalkeeper) continue;
        for (let j = 0; j < weaker.length; j++) {
          if (weaker[j].isGoalkeeper) continue;

          const newStrongerSum =
            sumA > sumB
              ? sumA - stronger[i].overall + weaker[j].overall
              : sumB - stronger[i].overall + weaker[j].overall;
          const newWeakerSum =
            sumA > sumB
              ? sumB - weaker[j].overall + stronger[i].overall
              : sumA - weaker[j].overall + stronger[i].overall;

          const diff = Math.abs(newStrongerSum - newWeakerSum);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSwap = [i, j];
          }
        }
      }

      if (bestSwap) {
        const [si, wi] = bestSwap;
        const temp = stronger[si];
        stronger[si] = weaker[wi];
        weaker[wi] = temp;
      }
    }

    return { teamA, teamB };
  }

  async addEvent(matchId: string, dto: CreateEventDto) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    const event = await this.prisma.matchEvent.create({
      data: {
        matchId,
        playerId: dto.playerId || null,
        teamId: dto.teamId || null,
        type: dto.type as EventType,
        minute: dto.minute,
        round: dto.round || match.currentRound,
        details: dto.details || undefined,
      },
    });

    if (dto.type === 'GOAL' && dto.playerId) {
      await this.prisma.playerProfile.update({
        where: { id: dto.playerId },
        data: { totalGoals: { increment: 1 } },
      });
    }

    if (dto.type === 'ASSIST' && dto.playerId) {
      await this.prisma.playerProfile.update({
        where: { id: dto.playerId },
        data: { totalAssists: { increment: 1 } },
      });
    }

    if (dto.type === 'GOAL' && dto.teamId) {
      await this.prisma.team.update({
        where: { id: dto.teamId },
        data: { score: { increment: 1 } },
      });
    }

    return event;
  }

  async startMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    const validStatuses: MatchStatus[] = ['SCHEDULED', 'DRAFTING', 'DRAFT_READY', 'CONFIRMING'];
    if (!validStatuses.includes(match.status)) {
      throw new BadRequestException('Partida não pode ser iniciada neste status');
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'LIVE', startedAt: new Date() },
    });
  }

  async endMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teams: true,
        confirmations: { where: { status: 'CONFIRMED' } },
      },
    });

    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    if (match.status !== 'LIVE' && match.status !== 'PAUSED') {
      throw new BadRequestException('Partida não está em andamento');
    }

    if (match.teams.length >= 2) {
      const sorted = [...match.teams].sort((a, b) => b.score - a.score);
      const isDraw = sorted[0].score === sorted[1].score;

      for (const team of match.teams) {
        const isWinner = !isDraw && team.id === sorted[0].id;
        await this.prisma.team.update({
          where: { id: team.id },
          data: { isWinner },
        });

        const teamPlayers = await this.prisma.teamPlayer.findMany({
          where: { teamId: team.id },
        });

        for (const tp of teamPlayers) {
          const updateData: Record<string, unknown> = {
            totalMatches: { increment: 1 },
          };

          if (isDraw) {
            updateData.totalDraws = { increment: 1 };
          } else if (isWinner) {
            updateData.totalWins = { increment: 1 };
          } else {
            updateData.totalLosses = { increment: 1 };
          }

          await this.prisma.playerProfile.update({
            where: { id: tp.playerId },
            data: updateData,
          });
        }
      }
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'FINISHED', endedAt: new Date() },
    });
  }
}
