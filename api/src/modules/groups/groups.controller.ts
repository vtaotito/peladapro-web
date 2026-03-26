import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, JoinGroupDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(userId, dto);
  }

  @Get()
  findMyGroups(@CurrentUser('id') userId: string) {
    return this.groupsService.findMyGroups(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  @Put(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(userId, id, dto);
  }

  @Post(':id/join')
  join(@CurrentUser('id') userId: string, @Body() dto: JoinGroupDto) {
    return this.groupsService.joinByInviteCode(userId, dto.inviteCode);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.groupsService.getMembers(id);
  }

  @Post(':id/invite')
  generateInvite(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.groupsService.generateInvite(userId, id);
  }
}
