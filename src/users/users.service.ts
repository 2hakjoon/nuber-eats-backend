import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: createAccountInput): Promise<{ ok: boolean; error: string | null }> {
    //check new user
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      } else {
        await this.users.save(this.users.create({ email, password, role }));
        return { ok: true, error: null };
      }
    } catch (e) {
      console.log(e);
      return { ok: false, error: "Couldn't create account" };
    }
    //create user && password hashing
  }

  async login({ email, password }: LoginInput): Promise<{
    ok: boolean;
    error: string | null;
    token?: string;
  }> {
    // find the user with the email
    // check if the password is correct
    // make a JWT and give it to the user
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      } else {
        const passwordCorrect = await user.checkPassword(password);
        if (!passwordCorrect) {
          return {
            ok: false,
            error: 'Wrong password',
          };
        } else {
          return {
            ok: true,
            token: 'token',
            error: null,
          };
        }
      }
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
