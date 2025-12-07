import { IsArray, IsNotEmpty, IsOptional, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

class MediaItemDto {
  @ApiProperty({ example: "a1b2c3-file-id" })
  @IsString()
  mediaId: string;

  @ApiProperty({ example: "https://s3.amazonaws.com/bucket/image.jpg" })
  @IsString()
  url: string;

  @ApiProperty({ example: "image", enum: MediaType })
  @IsString()
  @IsEnum(MediaType)
  type: MediaType;
}

export class CreatePostDto {
  @ApiProperty({ example: "My first post!" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    type: [MediaItemDto],
    example: [
      {
        mediaId: "abc123",
        url: "https://s3.amazonaws.com/.../file.jpg",
        type: "image"
      }
    ]
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[];
}
