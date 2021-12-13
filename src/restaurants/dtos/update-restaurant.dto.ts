import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { createRestaurantDto } from "./create-restaurant.dto";

@InputType()
class UpdateRestaurantInputType extends PartialType(createRestaurantDto) {}

@ArgsType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
