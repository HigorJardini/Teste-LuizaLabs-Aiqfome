import { UserLoginRepository } from "@repositories-entities";
import { UserLoginEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { UserLoginTypeORMEntity } from "@database-entities";

export class TypeORMUserLoginRepository implements UserLoginRepository {
  private repository = AppDataSource.getRepository(UserLoginTypeORMEntity);

  async findByUsername(username: string): Promise<UserLoginEntity | null> {
    const userLogin = await this.repository.findOne({ where: { username } });
    if (!userLogin) {
      return null;
    }

    return {
      login_id: userLogin.login_id,
      username: userLogin.username || "",
      password: userLogin.password || "",
      status: userLogin.status || false,
      created_at: userLogin.created_at,
      updated_at: userLogin.updated_at,
    };
  }

  async create(userLogin: UserLoginEntity): Promise<UserLoginEntity> {
    const newUserLogin = this.repository.create(userLogin);
    const savedUserLogin = await this.repository.save(newUserLogin);
    return {
      login_id: savedUserLogin.login_id,
      username: savedUserLogin.username || "",
      password: savedUserLogin.password || "",
      status: savedUserLogin.status || false,
      created_at: savedUserLogin.created_at,
      updated_at: savedUserLogin.updated_at,
    };
  }
}
