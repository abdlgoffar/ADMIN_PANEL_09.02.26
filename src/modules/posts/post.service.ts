import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostImage } from './post-image.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { v4 as uuid } from 'uuid';
import { s3 } from 'src/configs/aws.config';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(PostImage) private postImageRepo: Repository<PostImage>,
  ) {}

  /**
   * Create post + upload multiple images
   * @param createPostDto DTO post
   * @param files array file multer
   * @param userId id user dari JWT
   */
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

  async findAll() {
    try {
      return await this.postRepo.find({
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
}
