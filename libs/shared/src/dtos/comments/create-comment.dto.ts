import { IsString, IsOptional } from "class-validator";

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  meta_data?: any;

  @IsString()
  post_id: string;
}
