import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogsDto } from './dto/blogs.dto';
import { plainToInstance } from 'class-transformer';
import { QueryUserDto } from '../users/dto/query-user.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { PageBlogParamsDto } from './dto/page-blog-params.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Public()
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

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    if (!slug || !slug.trim()) {
      throw new BadRequestException('slug参数不能为空');
    }
    const blog = await this.blogsService.findBySlug(slug);
    if (!blog) {
      throw new NotFoundException('该博客不存在');
    }
    const blogEntity = plainToInstance(QueryBlogsDto, {
      ...blog,
      user: plainToInstance(QueryUserDto, blog.user),
    });
    return blogEntity;
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
    @Req() req,
    @Param('id') id: number,
    @Body() updateBlogsDto: CreateBlogsDto,
  ) {
    const { userId } = req.user || {};
    await this.blogsService.update(userId, id, updateBlogsDto);
    return { message: '更新博客成功' };
  }

  @Post('/delete')
  async deleteOne(@Req() req, @Body('id') id: number) {
    const { userId } = req.user || {};
    await this.blogsService.deleteOne(userId, id);
    return { message: '删除成功' };
  }
}
