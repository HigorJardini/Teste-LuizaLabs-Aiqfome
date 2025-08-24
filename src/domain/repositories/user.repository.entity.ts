import { UserEntity } from "@entities";

export interface UserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByLoginId(login_id: number): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(id: number, user: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: number): Promise<boolean>;
}
