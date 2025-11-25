import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiBearerAuth, ApiTags, ApiParam } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@ApiTags('Todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('todos')
export class TodosController {
  constructor(private service: TodosService) { }

  // USER: Create todo
  @Post()
  create(@Body() dto: CreateTodoDto, @GetUser() user: UserDto) {
    return this.service.create(dto, user.id);
  }

  // USER: Get my todos
  @Get('me')
  getMyTodos(@GetUser() user: UserDto) {
    return this.service.findAllByUser(user.id);
  }

  // USER: Update my todo
  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Todo ID to update', type: String })
  update(@Param('id') id: string, @Body() dto: UpdateTodoDto) {
    return this.service.update(id, dto);
  }

  // USER: Get single todo
  @Get(':id')
  @ApiParam({ name: 'id', description: 'Todo ID to fetch', type: String })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // USER: Delete my todo
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Todo ID to delete', type: String })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // ADMIN: Get all todos from all users
  @Roles(Role.ADMIN)
  @Get()
  getAllTodos() {
    return this.service.findAll();
  }

  // ADMIN: Delete any todo
  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  @ApiParam({ name: 'id', description: 'Todo ID to delete', type: String })
  deleteAny(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
