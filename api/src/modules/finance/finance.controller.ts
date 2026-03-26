import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('groups/:groupId/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  getSummary(@Param('groupId') groupId: string) {
    return this.financeService.getSummary(groupId);
  }

  @Get('transactions')
  getTransactions(@Param('groupId') groupId: string) {
    return this.financeService.getTransactions(groupId);
  }

  @Post('transactions')
  createTransaction(
    @CurrentUser('id') userId: string,
    @Param('groupId') groupId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.financeService.createTransaction(userId, groupId, data as any);
  }

  @Get('wallets')
  getWallets(@Param('groupId') groupId: string) {
    return this.financeService.getWallets(groupId);
  }
}
