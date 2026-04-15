import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  yearOfStudy?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class ResendCodeDto {
  @IsEmail()
  email: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}