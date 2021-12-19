import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    //check new user
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      } else {
        const user = await this.users.save(
          this.users.create({ email, password, role }),
        );
        const verification = await this.verification.save(
          this.verification.create({
            user,
          }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
        return { ok: true };
      }
    } catch (e) {
      console.log(e);
      return { ok: false, error: "Couldn't create account" };
    }
    //create user && password hashing
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    // find the user with the email
    // check if the password is correct
    // make a JWT and give it to the user
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
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
          const token = this.jwtService.sign(user.id);
          return {
            ok: true,
            token: token,
            error: null,
          };
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: "Couldn't login",
      };
    }
  }
  async findUserById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail(id);
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      //존재하는 회원인지 조화
      const user = await this.users.findOne(userId);
      //인자에 이메일이 있을시 실행
      if (email) {
        user.email = email;
        //이메일 수정시 검증코드 생성
        user.emailVerified = false;
        await this.verification.delete({ user: { id: user.id } });
        const verification = await this.verification.save(
          this.verification.create({
            user,
          }),
        );
        console.log(verification);
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      //인자에 비밀번호가 있을시
      if (password) {
        user.password = password;
      }
      //유저정보 업데이트
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: "Couldn't edit profile",
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.emailVerified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return {
          ok: true,
        };
      } else {
        return {
          ok: false,
          error: 'Wrong email code',
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: "Couldn't verify email",
      };
    }
  }
}
