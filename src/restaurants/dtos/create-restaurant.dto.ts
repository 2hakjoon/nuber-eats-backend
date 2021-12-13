import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
