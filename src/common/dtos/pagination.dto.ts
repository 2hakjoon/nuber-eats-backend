import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field((type) => Number, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput {
  @Field((type) => Number, { nullable: true })
  totalPages?: number;
}
