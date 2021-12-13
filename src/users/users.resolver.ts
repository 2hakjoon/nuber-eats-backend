import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  createAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean)
  hi() {
    return true;
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') _createAccountInput: createAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const error = await this.usersService.createAccount(_createAccountInput);
      if (error) {
        return {
          ok: false,
          error,
        };
      } else {
        return {
          ok: true,
        };
      }
    } catch (e) {
      return {
        error: e,
        ok: false,
      };
    }
  }
}
