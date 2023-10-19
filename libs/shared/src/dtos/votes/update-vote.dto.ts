import { IsEnum } from "class-validator";
import { VoteType } from "../../entities";

export class UpdateVoteDto {
  @IsEnum(VoteType)
  type: VoteType;
}
