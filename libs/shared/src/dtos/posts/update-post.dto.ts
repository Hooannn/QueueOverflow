import { PartialType } from "@nestjs/mapped-types";
import { CreatePostDto } from ".";
export class UpdatePostDto extends PartialType(CreatePostDto) {}
