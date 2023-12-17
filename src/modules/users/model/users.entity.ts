import { BaseEntity } from 'src/shared/base/entity.base';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity({
    name: 'users',
  })
  export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', nullable: false })
    full_name: string;
  
    @Column({ type: 'varchar', nullable: true })
    email: string;
  
    @Column({ type: 'varchar', nullable: true })
    bio: string;
  
    @Column({ type: 'varchar', nullable: true })
    photo: string;
  
    @Column({ type: 'varchar', nullable: true, select: false })
    hashed_password: string;
  
    @Column({ type: 'timestamp', nullable: true })
    changed_password_at: Date;
  }
  