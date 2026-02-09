import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Post } from '../posts/post.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashedRefreshToken: string | null;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
