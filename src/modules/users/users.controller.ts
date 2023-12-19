import { BadRequestException, Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ERRORS_DICTIONARY } from 'src/constants/error-dictionary.constant';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  @Get()
  getUsers() {
    return {
      records: [],
      totalRecords: 19,
    };
  }
}
