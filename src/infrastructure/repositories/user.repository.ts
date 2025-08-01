import { UserRepository } from "@repositories-entities";
import { UserEntity } from "@entities";
import { AppDataSource } from "infrastructure/repositories/connection/pg";
import { UserTypeORMEntity } from "@database-entities";

export class TypeORMUserRepository implements UserRepository {
  private repository = AppDataSource.getRepository(UserTypeORMEntity);

  async findById(user_id: number): Promise<UserEntity | null> {
    try {
      console.log(`Finding user with ID: ${user_id}`);
      const user = await this.repository.findOne({ where: { user_id } });
      if (!user) {
        console.log(`User with ID ${user_id} not found`);
        return null;
      }
      console.log(`Found user: ${user.name} with ID: ${user.user_id}`);
      return {
        user_id: user.user_id ?? 0,
        name: user.name || "",
      };
    } catch (error) {
      console.error(`Error finding user by ID ${user_id}:`, error);
      throw error;
    }
  }

  async findByUserId(
    user_id: number,
    name?: string
  ): Promise<UserEntity | null> {
    try {
      console.log(
        `Finding user with business ID: ${user_id}${name ? ` and name: ${name}` : ""}`
      );

      const users = await this.repository.find({
        where: { user_id },
      });

      if (users.length === 0) {
        console.log(`No users found with business ID ${user_id}`);
        return null;
      }

      if (name) {
        const matchingUser = users.find((user) => user.name === name);
        if (matchingUser) {
          console.log(
            `Found exact match for user ${name} with business ID ${user_id}`
          );
          return {
            id: matchingUser.id,
            user_id: matchingUser.user_id!,
            name: matchingUser.name!,
          };
        }

        console.log(
          `No user found with business ID ${user_id} and name ${name}`
        );
        return null;
      }

      console.log(
        `Returning first user with business ID ${user_id}: ${users[0].name}`
      );
      return {
        id: users[0].id,
        user_id: users[0].user_id!,
        name: users[0].name!,
      };
    } catch (error) {
      console.error(`Error finding user by business ID ${user_id}:`, error);
      throw error;
    }
  }

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      console.log(`Creating/updating user with business ID: ${user.user_id}`);

      const existingUser = await this.findByUserId(user.user_id, user.name);

      if (existingUser) {
        await this.repository.update(
          { id: existingUser.id },
          { name: user.name }
        );

        return {
          id: existingUser.id,
          user_id: existingUser.user_id,
          name: user.name,
        };
      }

      const newUser = this.repository.create({
        user_id: user.user_id,
        name: user.name,
      });

      const savedUser = await this.repository.save(newUser);

      return {
        id: savedUser.id,
        user_id: savedUser.user_id!,
        name: savedUser.name!,
      };
    } catch (error) {
      console.error(
        `Error creating/updating user with ID ${user.user_id}:`,
        error
      );
      throw error;
    }
  }

  async findByName(name: string): Promise<UserEntity[]> {
    try {
      console.log(`Finding users with name: ${name}`);
      const users = await this.repository.find({ where: { name } });
      console.log(`Found ${users.length} users with name: ${name}`);

      return users.map((user) => ({
        user_id: user.user_id ?? 0,
        name: user.name || "",
      }));
    } catch (error) {
      console.error(`Error finding users by name ${name}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      console.log(`Retrieving all users`);
      const users = await this.repository.find();
      console.log(`Found ${users.length} users`);

      return users.map((user) => ({
        user_id: user.user_id ?? 0,
        name: user.name || "",
      }));
    } catch (error) {
      console.error(`Error retrieving all users:`, error);
      throw error;
    }
  }
}
