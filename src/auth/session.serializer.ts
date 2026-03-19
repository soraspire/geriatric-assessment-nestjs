import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user.email);
  }

  async deserializeUser(email: string, done: (err: Error, payload: any) => void): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user) {
      const { password, ...result } = user;
      done(null, result);
    } else {
      done(new Error('User not found'), null);
    }
  }
}
