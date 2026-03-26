import { IsString, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsOptional()
  playerId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsEnum([
    'GOAL',
    'ASSIST',
    'SAVE',
    'TACKLE',
    'ERROR',
    'YELLOW_CARD',
    'RED_CARD',
    'SUBSTITUTION',
    'MATCH_START',
    'MATCH_END',
    'ROUND_START',
    'ROUND_END',
  ])
  type!: string;

  @IsNumber()
  @IsOptional()
  minute?: number;

  @IsNumber()
  @IsOptional()
  round?: number;

  @IsObject()
  @IsOptional()
  details?: Record<string, unknown>;
}
