import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    console.log(owner);
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);

      newRestaurant.owner = owner;

      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();

      const categorySulg = categoryName.replace(/ /g, '-');

      let category = await this.categories.findOne({ slug: categorySulg });

      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySulg, name: categoryName }),
        );
      }
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        error: null,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }
}
