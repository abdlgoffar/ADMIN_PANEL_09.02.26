import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostImage } from './post-image.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { v4 as uuid } from 'uuid';
import { s3 } from 'src/configs/aws.config';
import { QueryPostDto } from './dto/query-post.dto';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(PostImage) private postImageRepo: Repository<PostImage>,
  ) {}

  async createWithImages(
    createPostDto: CreatePostDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    let post: Post;

    try {
      post = this.postRepo.create({
        ...createPostDto,
        user_id: userId,
      });
      await this.postRepo.save(post);
    } catch (err) {
      console.error('Gagal menyimpan post', err);
      throw new InternalServerErrorException(
        'Gagal menyimpan post ke database',
      );
    }

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const savedName = `${uuid()}-${file.originalname}`;

        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
          throw new InternalServerErrorException(
            'AWS_BUCKET_NAME tidak dikonfigurasi',
          );
        }

        const params = {
          Bucket: bucketName,
          Key: savedName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        let uploaded;
        try {
          uploaded = await s3.upload(params).promise();
        } catch (err) {
          console.error(
            `Gagal upload file ${file.originalname} ke AWS S3`,
            err,
          );
          throw new InternalServerErrorException(
            `Gagal upload file ${file.originalname} ke AWS S3`,
          );
        }

        return this.postImageRepo.create({
          original_name: file.originalname,
          saved_name: savedName,
          url: uploaded.Location,
          post_id: post.id,
        });
      });

      try {
        const postImages = await Promise.all(uploadPromises);
        await this.postImageRepo.save(postImages);
      } catch (err) {
        console.error('Gagal menyimpan post images', err);
        throw new InternalServerErrorException(
          'Gagal menyimpan post images ke database',
        );
      }
    }

    return this.findOne(post.id);
  }

  async findOne(id: number) {
    try {
      return await this.postRepo.findOne({
        where: { id },
        relations: ['user', 'images'],
      });
    } catch (err) {
      console.error('Gagal fetch post', err);
      throw new InternalServerErrorException(
        'Gagal mengambil post dari database',
      );
    }
  }

  async findAllMyPost(userId: number, limit = 10, offset = 0) {
    try {
      return await this.postRepo.find({
        where: {
          user_id: userId,
          is_deleted: false,
        },
        relations: ['user', 'images'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });
    } catch (err) {
      console.error('Gagal fetch my posts', err);
      throw new InternalServerErrorException('Gagal mengambil post milik user');
    }
  }

  async findAllOtherPost() {
    try {
      return await this.postRepo.find({
        where: { is_deleted: false },
        relations: ['user', 'images'],
        order: { created_at: 'DESC' },
      });
    } catch (err) {
      console.error('Gagal fetch semua posts', err);
      throw new InternalServerErrorException(
        'Gagal mengambil posts dari database',
      );
    }
  }

  async update(id: number, updateData: Partial<Post>) {
    try {
      await this.postRepo.update(id, updateData);
      return this.findOne(id);
    } catch (err) {
      console.error('Gagal update post', err);
      throw new InternalServerErrorException('Gagal update post');
    }
  }

  async remove(id: number) {
    try {
      await this.postRepo.update(id, { is_deleted: true });
      return { deleted: true };
    } catch (err) {
      console.error('Gagal hapus post', err);
      throw new InternalServerErrorException('Gagal menghapus post');
    }
  }

  async updateParagraph(
    postId: number,
    userId: number,
    role: UserRole,
    updateDto: { paragraph?: string },
  ) {
    const post = await this.postRepo.findOne({
      where: { id: postId, is_deleted: false },
    });

    if (!post) {
      throw new NotFoundException('Post tidak ditemukan');
    }

    if (role === UserRole.USER && post.user_id !== userId) {
      throw new ForbiddenException('Tidak punya akses mengubah post ini');
    }

    await this.postRepo.update(postId, {
      paragraph: updateDto.paragraph,
    });

    return this.findOne(postId);
  }

  async softDelete(postId: number, userId: number, role: UserRole) {
    const post = await this.postRepo.findOne({
      where: { id: postId, is_deleted: false },
    });

    if (!post) {
      throw new NotFoundException('Post tidak ditemukan');
    }

    if (role === UserRole.USER && post.user_id !== userId) {
      throw new ForbiddenException('Tidak punya akses menghapus post ini');
    }

    await this.postRepo.update(postId, { is_deleted: true });

    return { message: 'Post berhasil dihapus' };
  }

  async findAllPaginated(query: QueryPostDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortOrder = query.sort?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.images', 'images')
      .where('post.is_deleted = :isDeleted', { isDeleted: false });

    if (query.search) {
      qb.andWhere('MATCH(post.paragraph) AGAINST (:search IN BOOLEAN MODE)', {
        search: `${query.search}*`,
      });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('post.created_at BETWEEN :start AND :end', {
        start: query.startDate,
        end: query.endDate,
      });
    }

    if (query.startDate && !query.endDate) {
      qb.andWhere('post.created_at >= :start', {
        start: query.startDate,
      });
    }

    if (!query.startDate && query.endDate) {
      qb.andWhere('post.created_at <= :end', {
        end: query.endDate,
      });
    }

    qb.orderBy('post.created_at', sortOrder);

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
