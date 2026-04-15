import { IsString, IsUUID, IsOptional, IsEnum, IsBoolean } from "class-validator";
import { MatchStatus } from "../entities/Match.entity";

export class CreateMatchDto {
  @IsUUID()
  applicationId: string;

  @IsUUID()
  consultantId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMatchDto {
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  paymentConfirmed?: boolean;
}