import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.enetity';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  @Query(returns => Restaurant)
  myRestaurant(){
    return true;
  }
}
