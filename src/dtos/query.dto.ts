import { IsOptional, IsInt, Min, IsString } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC";
}

export class ApplicationFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  search?: string; // search by ticket_id, applicant name, email
}