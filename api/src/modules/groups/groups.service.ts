import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupDto) {
    const inviteCode = randomBytes(6).toString('hex');

    const group = await this.prisma.group.create({
      data: {
        ...dto,
        inviteCode,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });

    return group;
  }

  async findMyGroups(userId: string) {
    return this.prisma.group.findMany({
      where: {
        members: { some: { userId, isActive: true } },
        isActive: true,
      },
      include: {
        _count: { select: { members: true, matches: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
              include: { profile: { select: { id: true, nickname: true, primaryPosition: true, overall: true } } },
            },
          },
          orderBy: { role: 'asc' },
        },
        _count: { select: { matches: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    return group;
  }

  async update(userId: string, groupId: string, dto: UpdateGroupDto) {
    await this.requireAdmin(userId, groupId);

    return this.prisma.group.update({
      where: { id: groupId },
      data: dto,
    });
  }

  async joinByInviteCode(userId: string, inviteCode: string) {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Código de convite inválido');
    }

    const existing = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: group.id } },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Você já é membro deste grupo');
      }
      return this.prisma.groupMember.update({
        where: { id: existing.id },
        data: { isActive: true, role: 'PLAYER' },
      });
    }

    return this.prisma.groupMember.create({
      data: {
        userId,
        groupId: group.id,
        role: 'PLAYER',
      },
    });
  }

  async getMembers(groupId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    return this.prisma.groupMember.findMany({
      where: { groupId, isActive: true },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
          include: { profile: { select: { id: true, nickname: true, primaryPosition: true, overall: true, totalMatches: true } } },
        },
      },
      orderBy: { role: 'asc' },
    });
  }

  async generateInvite(userId: string, groupId: string) {
    await this.requireAdmin(userId, groupId);

    const inviteCode = randomBytes(6).toString('hex');

    await this.prisma.group.update({
      where: { id: groupId },
      data: { inviteCode },
    });

    return { inviteCode };
  }

  private async requireAdmin(userId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!member || !member.isActive) {
      throw new NotFoundException('Grupo não encontrado');
    }

    const adminRoles = ['OWNER', 'ADMIN', 'ORGANIZER'];
    if (!adminRoles.includes(member.role)) {
      throw new ForbiddenException('Permissão insuficiente');
    }

    return member;
  }
}
