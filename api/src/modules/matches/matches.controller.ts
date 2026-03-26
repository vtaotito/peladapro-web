import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto, ConfirmMatchDto, CreateEventDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('groups/:groupId/matches')
  create(
    @CurrentUser('id') userId: string,
    @Param('groupId') groupId: string,
    @Body() dto: CreateMatchDto,
  ) {
    return this.matchesService.create(userId, groupId, dto);
  }

  @Get('groups/:groupId/matches')
  findByGroup(@Param('groupId') groupId: string) {
    return this.matchesService.findByGroup(groupId);
  }

  @Get('matches/:id')
  findById(@Param('id') id: string) {
    return this.matchesService.findById(id);
  }

  @Post('matches/:id/confirm')
  confirm(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmMatchDto,
  ) {
    return this.matchesService.confirm(userId, id, dto);
  }

  @Post('matches/:id/draft')
  draft(@Param('id') id: string) {
    return this.matchesService.executeDraft(id);
  }

  @Post('matches/:id/events')
  addEvent(@Param('id') id: string, @Body() dto: CreateEventDto) {
    return this.matchesService.addEvent(id, dto);
  }

  @Post('matches/:id/start')
  start(@Param('id') id: string) {
    return this.matchesService.startMatch(id);
  }

  @Post('matches/:id/end')
  end(@Param('id') id: string) {
    return this.matchesService.endMatch(id);
  }
}
