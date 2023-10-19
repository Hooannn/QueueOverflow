import { IsString, IsOptional, IsEnum } from "class-validator";
import { VoteType } from "../../entities";

export class CreateVoteDto {
  @IsString()
  post_id: string;

  @IsEnum(VoteType)
  type: VoteType;
}
