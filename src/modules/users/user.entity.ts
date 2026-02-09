import { Entity, Column, PrimaryGeneratedColumn, IntegerType } from 'typeorm';
import { UserRole } from './user-role.enum';

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

  @Column({ nullable: true })
  photo_original_name: string;

  @Column({ nullable: true })
  photo_saved_name: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashedRefreshToken: string | null;
}
