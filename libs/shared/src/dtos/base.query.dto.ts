import { IsArray, IsNumberString, IsOptional, IsString } from "class-validator";

export class QueryDto {
  @IsOptional()
  @IsNumberString()
  offset?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}
