import { PartialType } from "@nestjs/mapped-types";
import { CreateNotificationDto } from ".";
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
