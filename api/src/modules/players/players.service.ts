import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Foot, Position, SkillLevel } from '@prisma/client';

interface UpdateProfileData {
  nickname?: string;
  bio?: string;
  primaryPosition?: Position;
  secondaryPositions?: Position[];
  dominantFoot?: Foot;
  skillLevel?: SkillLevel;
  city?: string;
  isPublicProfile?: boolean;
}

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return profile;
  }

  async updateMyProfile(userId: string, data: UpdateProfileData) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return this.prisma.playerProfile.update({
      where: { userId },
      data,
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }

  async getPublicProfile(profileId: string) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Jogador não encontrado');
    }

    if (!profile.isPublicProfile) {
      throw new NotFoundException('Perfil privado');
    }

    return profile;
  }

  async getPlayerStats(profileId: string) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Jogador não encontrado');
    }

    const recentMatches = await this.prisma.matchConfirmation.findMany({
      where: { playerId: profileId, status: 'CONFIRMED' },
      include: { match: { select: { id: true, title: true, scheduledAt: true, status: true } } },
      orderBy: { match: { scheduledAt: 'desc' } },
      take: 10,
    });

    const awards = await this.prisma.playerAward.findMany({
      where: { playerId: profileId },
      include: { match: { select: { id: true, title: true, scheduledAt: true } } },
      orderBy: { match: { scheduledAt: 'desc' } },
      take: 10,
    });

    const avgRating = await this.prisma.playerRating.aggregate({
      where: { playerId: profileId },
      _avg: { score: true },
      _count: true,
    });

    return {
      profile,
      recentMatches,
      awards,
      averageRating: avgRating._avg.score ?? profile.overall,
      totalRatings: avgRating._count,
    };
  }
}
