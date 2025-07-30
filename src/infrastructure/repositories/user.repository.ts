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
        user_id: user.user_id,
        name: user.name || "",
      };
    } catch (error) {
      console.error(`Error finding user by ID ${user_id}:`, error);
      throw error;
    }
  }

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      if (user.user_id) {
        console.log(
          `Attempting to create user with specific ID: ${user.user_id}`
        );

        const existingUser = await this.findById(user.user_id);
        if (existingUser) {
          console.log(
            `User with ID ${user.user_id} already exists, returning existing user`
          );
          return existingUser;
        }

        console.log(
          `Inserting new user with ID ${user.user_id} and name "${user.name}"`
        );
        await this.repository.query(
          `INSERT INTO users (user_id, name) VALUES ($1, $2) 
           ON CONFLICT (user_id) DO UPDATE SET name = $2`,
          [user.user_id, user.name]
        );

        return {
          user_id: user.user_id,
          name: user.name,
        };
      }

      console.log(
        `Creating user with auto-generated ID: ${JSON.stringify(user)}`
      );
      const newUser = this.repository.create(user);
      const savedUser = await this.repository.save(newUser);
      console.log(`Created user with ID: ${savedUser.user_id}`);

      return {
        user_id: savedUser.user_id,
        name: savedUser.name || "",
      };
    } catch (error) {
      console.error(`Error creating user:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<UserEntity[]> {
    try {
      console.log(`Finding users with name: ${name}`);
      const users = await this.repository.find({ where: { name } });
      console.log(`Found ${users.length} users with name: ${name}`);

      return users.map((user) => ({
        user_id: user.user_id,
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
        user_id: user.user_id,
        name: user.name || "",
      }));
    } catch (error) {
      console.error(`Error retrieving all users:`, error);
      throw error;
    }
  }
}
