import { UserEntity } from "@entities";
import { UserRepository } from "@repositories-entities";

export interface UpdateProfileInput {
  userId: number;
  name?: string;
  email?: string;
}

export interface UpdateProfileUseCase {
  execute(input: UpdateProfileInput): Promise<UserEntity>;
}

export class UpdateProfile implements UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UserEntity> {
    const { userId, ...userData } = input;

    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    if (userData.email) {
      const existingEmail = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingEmail && existingEmail.id !== userId) {
        throw new Error("Email already in use");
      }
    }

    return this.userRepository.update(userId, userData);
  }
}
