import { UserRepository } from "@repositories-entities";
import { UserEntity } from "@entities";
import { AppDataSource } from "infrastructure/repositories/connection/pg";
import { UserTypeORMEntity } from "@database-entities";

export class TypeORMUserRepository implements UserRepository {
  private repository = AppDataSource.getRepository(UserTypeORMEntity);

  async findById(user_id: number): Promise<UserEntity | null> {
    const user = await this.repository.findOne({ where: { user_id } });
    if (!user) return null;
    return {
      name: user.name || "",
    };
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const newUser = this.repository.create(user);
    const savedUser = await this.repository.save(newUser);
    return {
      ...savedUser,
      name: savedUser.name || "",
    };
  }
}
