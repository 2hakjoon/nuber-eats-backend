import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { createRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.enetity";
import { RestaurantService } from "./restaurants.service";

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query((returns) => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }
  @Mutation((retuns) => Boolean)
  async createRestaurant(
    @Args("input") _createRestaurantDto: createRestaurantDto
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(_createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
