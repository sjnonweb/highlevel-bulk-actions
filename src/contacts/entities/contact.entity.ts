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

  @Column()
  @Index()
  email: string;

  @Column()
  name: string;

  @Column()
  age: number;
}
