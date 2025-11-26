import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './todos.schema';
import { Model } from 'mongoose';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private model: Model<TodoDocument>) {}

  // Create a new todo linked to a user
  async create(dto: CreateTodoDto, userId: string): Promise<Todo> {
    return await this.model.create({ ...dto, userId });
  }

  // Get all todos for a specific user
  async findAllByUser(userId: string): Promise<Todo[]> {
    return await this.model.find({ userId }).exec();
  }

  // Get all todos
  async findAll(): Promise<Todo[]> {
    return await this.model.find().exec();
  }

  // Update a todo by ID
  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return updated;
  }

  // Find a single todo by ID
  async findById(id: string): Promise<Todo> {
    const todo = await this.model.findById(id).populate('userId').exec();
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  // Delete a todo by ID
  async delete(id: string): Promise<Todo> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return deleted;
  }
}
