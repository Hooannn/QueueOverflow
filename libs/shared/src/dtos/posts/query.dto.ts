import { IsArray, IsOptional } from "class-validator";
import { QueryDto } from "../base.query.dto";

export class QueryPostDto extends QueryDto {
  @IsOptional()
  @IsArray()
  topicIds?: string[];
}
