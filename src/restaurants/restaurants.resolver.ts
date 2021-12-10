import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { createRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.enetity";

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  restaurants(@Args("veganOnly") veganOnly: boolean): Restaurant[] {
    return [];
  }
  @Mutation((retuns) => Boolean)
  createRestaurant(@Args() crateRestaurantInput: createRestaurantDto): boolean {
    console.log(crateRestaurantInput);
    return true;
  }
}
