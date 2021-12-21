import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dot';
import { RestaurantOutput, RestaurantsInput } from './dtos/restaurants.dto';
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
  ): Promise<EditRestaurantOutput> {
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
        } else {
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
          return { ok: true };
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could't edit Restaurant",
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        deleteRestaurantInput.restaurantId,
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
            error: "You can't delete a restaurant that you don't own",
          };
        } else {
          await this.restaurants.delete(deleteRestaurantInput.restaurantId);
          return {
            ok: true,
          };
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could't delete restaurant",
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: "Couldn't load categories",
      };
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({ slug, page }): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'category not found',
        };
      } else {
        const restaurants = await this.restaurants.find({
          where: {
            category,
          },
          take: 5,
          skip: (page - 1) * 5,
        });
        const totalResults = await this.countRestaurant(category);
        return {
          ok: true,
          restaurant: restaurants,
          category,
          totalPages: Math.ceil(totalResults / 5),
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: "Couldn't load category",
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: 5,
        skip: (page - 1) * 5,
      });
      return {
        ok: true,
        restaurants: restaurants,
        totalPages: Math.ceil(totalResults / 5),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }
}
