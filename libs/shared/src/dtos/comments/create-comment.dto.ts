import { IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  meta_data?: any;

  @IsOptional()
  @IsBoolean()
  is_root?: boolean;

  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsString()
  post_id: string;
}
