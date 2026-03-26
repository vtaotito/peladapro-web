import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  defaultLocation?: string;

  @IsArray()
  @IsOptional()
  defaultDays?: number[];

  @IsString()
  @IsOptional()
  defaultTime?: string;

  @IsNumber()
  @IsOptional()
  playerLimit?: number;

  @IsNumber()
  @IsOptional()
  goalkeeperLimit?: number;

  @IsNumber()
  @IsOptional()
  matchDuration?: number;

  @IsNumber()
  @IsOptional()
  monthlyFee?: number;

  @IsNumber()
  @IsOptional()
  dailyFee?: number;

  @IsBoolean()
  @IsOptional()
  autoCharge?: boolean;
}
