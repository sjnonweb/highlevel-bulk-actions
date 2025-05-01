import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Contact extends BaseEntity {
  @Column()
  @Index()
  accountId: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @Column()
  age: number;
}
