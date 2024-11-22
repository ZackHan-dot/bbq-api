import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { In, Repository } from 'typeorm';
import { CreateBlogsDto } from './dto/blogs.dto';
import { Tag } from '../tags/entities/tag.entity';
import { PageBlogParamsDto } from './dto/page-blog-params.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
  ) {}

  async findBlogs(pageBlogParamsDto: PageBlogParamsDto, userId?: number) {
    const { currentPage, limit, sortBy, sortOrder, tags, title } =
      pageBlogParamsDto;
    // 检查排序字段是否存在
    const validSortFields = ['createdAt', 'updatedAt'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error('无效的排序字段');
    }
    // 构建查询
    const query = this.blogRepository.createQueryBuilder('blogs');
    if (userId) {
      // 筛选指定用户
      query.andWhere('blogs.user_id = :userId', { userId });
    }
    // 应用筛选条件
    if (title) {
      query.andWhere('blogs.title LIKE :title', { title: `%${title}%` });
    }
    if (sortBy) {
      // 应用排序
      query.orderBy(`blogs.${sortBy}`, sortOrder);
    }
    // 加载关联的标签和用户
    query.leftJoinAndSelect('blogs.tags', 'tags');
    query.leftJoinAndSelect('blogs.user', 'user');

    // 设置分页
    query.skip((currentPage - 1) * limit).take(limit);

    if (tags && tags.length > 0) {
      const existingTags = await this.tagRepository.find({
        where: { id: In(tags) },
      });
      if (existingTags.length > 0) {
        query.andWhere(
          'blogs.id IN (SELECT blog_id FROM blog_tags WHERE tag_id IN (:...tagIds))',
          { tagIds: existingTags.map((tag) => tag.id) }, // 这里需要明确是id，否则会出现id歧义
        );
      } else {
        // 如果没有找到任何标签，返回空结果
        return {
          items: [],
          currentPage,
          limit,
          total: 0,
        };
      }
    }
    try {
      const [items, total] = await query.getManyAndCount();

      return {
        items,
        currentPage,
        limit,
        total,
      };
    } catch (error) {
      throw new Error(`查询博客列表时发生错误: ${error.message}`);
    }
  }

  async findAll(pageBlogParamsDto: PageBlogParamsDto) {
    return await this.findBlogs(pageBlogParamsDto);
  }

  async findByUserId(userId: number, pageBlogParamsDto: PageBlogParamsDto) {
    return await this.findBlogs(pageBlogParamsDto, userId);
  }

  async create(createBlogsDto: CreateBlogsDto) {
    const { tags, ...blogData } = createBlogsDto;
    const tagIds = tags || [];
    const existingTags = await this.tagRepository.find({
      where: { id: In(tagIds) },
    });
    if (existingTags.length !== tagIds.length) {
      throw new NotFoundException('部分标签没有找到');
    }
    const blogs = this.blogRepository.create({
      ...blogData,
      tags: existingTags,
    });
    return await this.blogRepository.save(blogs);
  }

  /**
   * save 方法：适用于需要处理复杂实体关系和触发生命周期钩子的场景。
   * update 方法：适用于简单的更新操作，性能较高，不涉及复杂关系。
   * Object.assign：用于合并对象，更新对象的属性。
   * @param id 博客id
   * @param updateBlogsDto 要更新的blog的Dto对象，与创建相同
   * @returns
   */
  async update(id: number, updateBlogsDto: CreateBlogsDto) {
    const { tags, ...blogData } = updateBlogsDto;
    const tagIds = tags || [];
    const existingTags = await this.tagRepository.find({
      where: { id: In(tagIds) },
    });
    if (existingTags.length !== tagIds.length) {
      throw new NotFoundException('部分标签没有找到');
    }

    const originBlog = await this.blogRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!originBlog) {
      throw new NotFoundException('博客未找到');
    }
    // 更新博客数据
    Object.assign(originBlog, blogData);
    originBlog.tags = existingTags;
    return this.blogRepository.save(originBlog);
  }

  async deleteOne(userId: number, id: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!blog) {
      throw new NotFoundException('博客未找到');
    }

    if (!userId || blog.user.id !== userId) {
      throw new ForbiddenException('用户没有权限删除该博客');
    }

    // 删除博客实体
    return await this.blogRepository.remove(blog); // 级联删除需要使用它
  }
}
