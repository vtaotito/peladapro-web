import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlayersModule } from './modules/players/players.module';
import { GroupsModule } from './modules/groups/groups.module';
import { MatchesModule } from './modules/matches/matches.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlayersModule,
    GroupsModule,
    MatchesModule,
    FinanceModule,
    NotificationsModule,
  ],
})
export class AppModule {}
