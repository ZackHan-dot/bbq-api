import { Controller, Get, Post, Body, Query, Param, Put } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagDto } from './dto/tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Query() queryTagDto: QueryTagDto) {
    return this.tagsService.findAll(queryTagDto);
  }

  @Post('save')
  async create(@Body() body: TagDto) {
    await this.tagsService.create(body);
    return { message: '保存成功' };
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() body: TagDto) {
    await this.tagsService.update(id, body);
    return { message: '更新成功' };
  }

  @Post('delete')
  async delete(@Body('id') id: number) {
    await this.tagsService.deleteOne(id);
    return { message: '删除成功' };
  }
}
