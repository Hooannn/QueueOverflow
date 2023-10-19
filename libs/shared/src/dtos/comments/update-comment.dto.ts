import { IsOptional, IsString } from "class-validator";

export class UpdateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  meta_data?: any;
}
