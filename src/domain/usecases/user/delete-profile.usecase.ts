import { UserRepository } from "@repositories-entities";

export interface DeleteProfileUseCase {
  execute(userId: number): Promise<boolean>;
}

export class DeleteProfile implements DeleteProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return this.userRepository.delete(userId);
  }
}
