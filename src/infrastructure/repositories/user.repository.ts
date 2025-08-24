import { UserRepository } from "@repositories-entities";
import { UserEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { User } from "@database-entities";

export class TypeORMUserRepository implements UserRepository {
  private repository = AppDataSource.getRepository(User);

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.repository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      login_id: user.login_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.repository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      login_id: user.login_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findByLoginId(login_id: number): Promise<UserEntity | null> {
    const user = await this.repository.findOne({
      where: { login_id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      login_id: user.login_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const newUser = this.repository.create({
      name: user.name,
      email: user.email,
      login_id: user.login_id,
    });

    const savedUser = await this.repository.save(newUser);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      login_id: savedUser.login_id,
      created_at: savedUser.created_at,
      updated_at: savedUser.updated_at,
    };
  }

  async update(id: number, user: Partial<UserEntity>): Promise<UserEntity> {
    await this.repository.update(id, user);

    const updatedUser = await this.repository.findOneOrFail({
      where: { id },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      login_id: updatedUser.login_id,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected != null && result.affected > 0;
  }
}
