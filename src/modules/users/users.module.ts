import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/users.entity';

const UserRepository = TypeOrmModule.forFeature([User]);

@Module({
    imports: [UserRepository],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule { }
