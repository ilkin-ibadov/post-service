import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class DeleteTodoDto {
  @ApiProperty({ description: 'ID of the todo to delete' })
  @IsMongoId()
  id: string;
}
