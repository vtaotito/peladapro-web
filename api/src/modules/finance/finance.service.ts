import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { TransactionType, PaymentStatus } from '@prisma/client';

interface CreateTransactionData {
  type: TransactionType;
  category?: string;
  amount: number;
  description?: string;
  walletId?: string;
  status?: PaymentStatus;
  reference?: string;
}

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(groupId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    const income = await this.prisma.financialTransaction.aggregate({
      where: { groupId, type: 'INCOME', status: 'PAID' },
      _sum: { amount: true },
    });

    const expense = await this.prisma.financialTransaction.aggregate({
      where: { groupId, type: 'EXPENSE', status: 'PAID' },
      _sum: { amount: true },
    });

    const pending = await this.prisma.financialTransaction.aggregate({
      where: { groupId, status: 'PENDING' },
      _sum: { amount: true },
      _count: true,
    });

    const overdue = await this.prisma.financialTransaction.aggregate({
      where: { groupId, status: 'OVERDUE' },
      _sum: { amount: true },
      _count: true,
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pending: {
        amount: pending._sum.amount || 0,
        count: pending._count,
      },
      overdue: {
        amount: overdue._sum.amount || 0,
        count: overdue._count,
      },
    };
  }

  async getTransactions(groupId: string) {
    return this.prisma.financialTransaction.findMany({
      where: { groupId },
      include: {
        wallet: {
          include: {
            player: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createTransaction(
    userId: string,
    groupId: string,
    data: CreateTransactionData,
  ) {
    const member = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!member || !member.isActive) {
      throw new ForbiddenException('Você não é membro deste grupo');
    }

    const allowedRoles = ['OWNER', 'ADMIN', 'TREASURER'];
    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Apenas administradores ou tesoureiros podem criar transações');
    }

    const transaction = await this.prisma.financialTransaction.create({
      data: {
        groupId,
        walletId: data.walletId || null,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        status: data.status || 'PENDING',
        reference: data.reference,
        createdBy: userId,
      },
    });

    if (data.walletId && data.status === 'PAID') {
      const increment = data.type === 'INCOME' ? data.amount : -data.amount;
      await this.prisma.wallet.update({
        where: { id: data.walletId },
        data: { balance: { increment } },
      });
    }

    return transaction;
  }

  async getWallets(groupId: string) {
    return this.prisma.wallet.findMany({
      where: { groupId },
      include: {
        player: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { transactions: true } },
      },
      orderBy: { balance: 'desc' },
    });
  }
}
