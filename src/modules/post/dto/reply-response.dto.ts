import { ApiProperty } from "@nestjs/swagger";

export class ReplyResponseDto {
    @ApiProperty({
        example: "uuid-of-like"
    })
    id: string

    @ApiProperty({
        example: "uuid-of-post"
    })
    postId: string

    @ApiProperty({
        example: "uuid-of-user"
    })
    userId: string

    @ApiProperty({
        example: "This is a reply text"
    })
    text: string

    @ApiProperty({
        example: "2024-06-15T12:34:56.789Z"
    })
    createdAt: Date

    @ApiProperty({
        example: "2024-06-15T12:34:56.789Z"
    })
    updatedAt: Date
}
