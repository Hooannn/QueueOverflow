import { IsString } from "class-validator";

export class GithubAuthDto {
  @IsString()
  readonly code: string;
}
