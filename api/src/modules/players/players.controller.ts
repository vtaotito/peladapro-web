import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.playersService.getMyProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@CurrentUser('id') userId: string, @Body() data: Record<string, unknown>) {
    return this.playersService.updateMyProfile(userId, data);
  }

  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.playersService.getPublicProfile(id);
  }

  @Get(':id/stats')
  getPlayerStats(@Param('id') id: string) {
    return this.playersService.getPlayerStats(id);
  }
}
