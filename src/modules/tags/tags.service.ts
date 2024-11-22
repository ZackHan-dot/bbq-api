import { Injectable } from '@nestjs/common';
import { Tag } from './entities/tag.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagDto } from './dto/tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findAll(queryTagDto: QueryTagDto): Promise<Tag[]> {
    const filterByName = {};
    const filterByTagTypeName = {};

    if (queryTagDto.name) {
      filterByName['name'] = Like(`%${queryTagDto.name}%`);
    }

    if (queryTagDto.tagTypeId) {
      filterByTagTypeName['id'] = queryTagDto.tagTypeId;
    }

    return this.tagsRepository.find({
      where: { ...filterByName, tagType: filterByTagTypeName },
      relations: ['tagType'],
    });
  }

  async create(tagDto: TagDto): Promise<Tag> {
    const tag = this.tagsRepository.create(tagDto);
    return await this.tagsRepository.save(tag);
  }

  async update(id: number, tagDto: TagDto) {
    const tag = this.tagsRepository.create(tagDto);
    return await this.tagsRepository.update(id, tag);
  }

  async deleteOne(id: number) {
    return await this.tagsRepository.delete(id);
  }
}
