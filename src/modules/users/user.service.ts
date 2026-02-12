/*
https://docs.nestjs.com/providers#services
*/

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { User } from './entity/user.entity';
import { UserProfile } from './entity/user-profile.entity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  private s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION,
  });

  async updateUserProfile(
    userId: number,
    dto: UpdateUserProfileDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    let profile = user.profile;

    let photoData: Partial<UserProfile> = {};

    if (file) {
      const bucketName = process.env.AWS_BUCKET_NAME!;
      const savedName = `profile/${uuid()}-${file.originalname}`;

      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: savedName,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${savedName}`;

        photoData = {
          photo_original_name: file.originalname,
          photo_saved_name: savedName,
          photo_url: fileUrl,
        };
      } catch (err) {
        console.error('Gagal upload photo ke S3', err);
        throw new InternalServerErrorException('Gagal upload photo ke AWS S3');
      }
    }

    const cleanedDto: Partial<UserProfile> = {};

    Object.keys(dto).forEach((key) => {
      const value = dto[key];

      if (value !== undefined && value !== '') {
        cleanedDto[key] = value;
      }
    });

    if (cleanedDto.date_of_birth) {
      cleanedDto.date_of_birth = new Date(
        cleanedDto.date_of_birth as any,
      ) as any;
    }

    if (!profile) {
      profile = this.profileRepository.create({
        ...cleanedDto,
        ...photoData,
        user,
      });
    } else {
      Object.assign(profile, cleanedDto);
      Object.assign(profile, photoData);
    }

    await this.profileRepository.save(profile);

    return profile;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'role', 'hashedRefreshToken'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async update(userId: number, data: Partial<User>): Promise<void> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update values provided');
    }

    await this.userRepository.update(userId, data);
  }

  async create(data: DeepPartial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findUserWithProfile(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
  }
}
