import { IsString, IsOptional, IsEnum } from "class-validator";
import { VoteType } from "../../entities";

export class CreateVoteDto {
  @IsEnum(VoteType)
  type: VoteType;
}
export class CreatePostVoteDto extends CreateVoteDto {
  @IsString()
  post_id: string;
}

export class CreateCommentVoteDto extends CreateVoteDto {
  @IsString()
  comment_id: string;
}
