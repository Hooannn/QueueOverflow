import { IsString, IsOptional } from "class-validator";

export class CreateFcmTokenDto {
  @IsOptional()
  @IsString()
  android?: string;

  @IsOptional()
  @IsString()
  web?: string;

  @IsOptional()
  @IsString()
  ios?: string;
}
