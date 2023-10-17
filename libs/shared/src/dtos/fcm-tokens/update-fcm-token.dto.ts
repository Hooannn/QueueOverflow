import { PartialType } from "@nestjs/mapped-types";
import { CreateFcmTokenDto } from ".";
export class UpdateFcmTokenDto extends PartialType(CreateFcmTokenDto) {}
