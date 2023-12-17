import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/base/service.base';
import { User } from './model/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends BaseService<User> {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) {
        super(repository);
    }
}
