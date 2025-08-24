import { UserEntity } from "@entities";
import { UserRepository } from "@repositories-entities";

export interface GetProfileUseCase {
  execute(userId: number): Promise<UserEntity>;
}

export class GetProfile implements GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
