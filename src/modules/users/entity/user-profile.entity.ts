import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserGender } from './user-gender.enum';
import { User } from './user.entity';

@Entity({ name: 'users_profile' })
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  bio: string;

  @Column({ type: 'varchar', length: 255 })
  education: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  skills: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: UserGender,
  })
  gender: UserGender;

  @Column({ type: 'varchar', length: 255 })
  photo_original_name: string;

  @Column({ type: 'varchar', length: 255 })
  photo_saved_name: string;

  @Column({ type: 'varchar', length: 500 })
  photo_url: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
