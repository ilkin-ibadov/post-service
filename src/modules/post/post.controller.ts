import {
  Controller, Post, Body, Req, Get, Param, Delete, Query, Patch
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Post as PostEntity } from './post.entity';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully.', type: PostEntity })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async create(@Req() req, @Body() dto: CreatePostDto) {
    return this.postService.create(req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiOkResponse({ description: 'The post.', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async getById(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'List of posts.', type: [PostEntity] })
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    return this.postService.findAll(pageNum, limitNum);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ description: 'Post updated successfully.', type: PostEntity })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async update(@Param('id') id: string, @Req() req, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiOkResponse({ description: 'Post deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async delete(@Param('id') id: string, @Req() req) {
    return this.postService.delete(id, req.user.id);
  }
}
