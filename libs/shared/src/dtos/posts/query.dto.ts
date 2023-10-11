import { IsArray, IsOptional, IsString } from "class-validator";
import { QueryDto } from "../base.query.dto";

export class QueryPostDto extends QueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[];
}
