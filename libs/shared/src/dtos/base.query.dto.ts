import { IsArray, IsNumberString, IsOptional } from "class-validator";

export class QueryDto {
  @IsOptional()
  @IsNumberString()
  offset?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsArray()
  relations?: string[];
}
