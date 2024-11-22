import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogsDto } from './dto/blogs.dto';
import { plainToInstance } from 'class-transformer';
import { QueryUserDto } from '../users/dto/query-user.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { PageBlogParamsDto } from './dto/page-blog-params.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async findAll(@Query() pageBlogParamsDto: PageBlogParamsDto) {
    const blogs = await this.blogsService.findAll(pageBlogParamsDto);
    const blogEntities = blogs.items.map((blog) => {
      return plainToInstance(QueryBlogsDto, {
        ...blog,
        user: plainToInstance(QueryUserDto, blog.user),
      });
    });
    return { ...blogs, items: blogEntities };
  }
  @Get('/:userId')
  async findByUserId(
    @Param('userId') userId: number,
    @Query() pageBlogParamsDto: PageBlogParamsDto,
  ) {
    const blogs = await this.blogsService.findByUserId(
      userId,
      pageBlogParamsDto,
    );
    const blogEntities = blogs.items.map((blog) => {
      return plainToInstance(QueryBlogsDto, {
        ...blog,
        user: plainToInstance(QueryUserDto, blog.user),
      });
    });
    return blogEntities;
  }

  @Post('save')
  async create(@Body() createBlogsDto: CreateBlogsDto) {
    await this.blogsService.create(createBlogsDto);
    return { message: '创建博客成功' };
  }

  @Put('/update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateBlogsDto: CreateBlogsDto,
  ) {
    await this.blogsService.update(id, updateBlogsDto);
    return { message: '更新博客成功' };
  }

  @Post('/delete')
  async deleteOne(@Req() req, @Body('id') id: number) {
    const { id: userId } = req.user || {};
    await this.blogsService.deleteOne(userId, id);
    return { message: '删除成功' };
  }
}
