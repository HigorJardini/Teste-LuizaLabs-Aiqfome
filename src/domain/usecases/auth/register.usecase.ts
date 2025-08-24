import { UserLoginRepository, UserRepository } from "@repositories-entities";
import { RegisterUserDTO } from "@dtos";
import { hash } from "bcrypt";

export interface RegisterUseCase {
  execute(data: RegisterUserDTO): Promise<{ userId: number; loginId: number }>;
}

export class Register implements RegisterUseCase {
  constructor(
    private userLoginRepository: UserLoginRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    data: RegisterUserDTO
  ): Promise<{ userId: number; loginId: number }> {
    const { username, password, name, email } = data;

    const existingUsername =
      await this.userLoginRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await hash(password, 10);
    const userLogin = await this.userLoginRepository.create({
      username,
      password: hashedPassword,
      status: true,
    });

    const user = await this.userRepository.create({
      name,
      email,
      login_id: userLogin.login_id,
    });

    return {
      userId: user.id!,
      loginId: userLogin.login_id!,
    };
  }
}
