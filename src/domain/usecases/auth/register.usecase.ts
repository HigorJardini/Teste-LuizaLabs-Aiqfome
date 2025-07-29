import { UserLoginRepository } from "@repositories-entities";
import { UserRepository } from "@repositories-entities";
import { RegisterUserDTO } from "@dtos";
import { hash } from "bcrypt";

export class RegisterUseCase {
  constructor(
    private userLoginRepository: UserLoginRepository,
    private userRepository: UserRepository
  ) {}

  async execute(data: RegisterUserDTO): Promise<boolean> {
    const { username, password, name } = data;

    const existingUser =
      await this.userLoginRepository.findByUsername(username);

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await hash(password, 10);

    const userLogin = await this.userLoginRepository.create({
      username,
      password: hashedPassword,
      status: true,
    });

    await this.userRepository.create({
      name,
    });

    return true;
  }
}
