import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  scheduledAt!: string;

  @IsNumber()
  @IsOptional()
  playerLimit?: number;

  @IsNumber()
  @IsOptional()
  goalkeeperLimit?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
