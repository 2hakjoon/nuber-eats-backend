import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditProfileOutput } from 'src/users/dtos/edit-profile.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { EditRestaurantInput } from './dtos/edit-restaurant.dot';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    console.log(owner);
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);

      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
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

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditProfileOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      } else {
        if (owner.id !== restaurant.ownerId) {
          return {
            ok: false,
            error: "You can't edit a restaurant that you don't own",
          };
        }
        let category: Category = null;
        if (editRestaurantInput.categoryName) {
          category = await this.categories.getOrCreate(
            editRestaurantInput.categoryName,
          );
        }
        await this.restaurants.save([
          {
            id: editRestaurantInput.restaurantId,
            ...editRestaurantInput,
            ...(category && { category }),
          },
        ]);
      }
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: "Could't edit Restaurant",
      };
    }
  }
}
