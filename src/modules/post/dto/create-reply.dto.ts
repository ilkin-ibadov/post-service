import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { MediaItemType } from "../reply.entity";

export class CreateReplyDto {
    @ApiProperty({
        example: "This is my reply",
        description: 'Text contents of the reply'
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsArray()
    @IsOptional()
    media?: MediaItemType
}