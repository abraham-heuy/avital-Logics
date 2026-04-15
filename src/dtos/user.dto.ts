import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  yearOfStudy?: string;

  @IsOptional()
  @IsString()
  techStack?: string; // for consultants
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}