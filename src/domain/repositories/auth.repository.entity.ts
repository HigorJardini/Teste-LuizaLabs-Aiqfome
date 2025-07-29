import { UserLoginEntity } from "@entities";

export interface UserLoginRepository {
  findByUsername(username: string): Promise<UserLoginEntity | null>;
  create(userLogin: UserLoginEntity): Promise<UserLoginEntity>;
}
