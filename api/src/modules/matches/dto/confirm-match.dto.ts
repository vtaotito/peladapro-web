import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class ConfirmMatchDto {
  @IsEnum(['CONFIRMED', 'MAYBE', 'OUT'])
  status!: 'CONFIRMED' | 'MAYBE' | 'OUT';

  @IsBoolean()
  @IsOptional()
  isGoalkeeper?: boolean;
}
