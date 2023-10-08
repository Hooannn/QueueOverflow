import { PartialType } from "@nestjs/mapped-types";
import { CreateTopicDto } from ".";
export class UpdateTopicDto extends PartialType(CreateTopicDto) {}
