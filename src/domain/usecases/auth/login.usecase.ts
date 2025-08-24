import { UserLoginRepository, UserRepository } from "@repositories-entities";
import { LoginUserDTO, AuthResponseDTO } from "@dtos";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { getEnv } from "@config/env";

export interface LoginUseCaseInput {
  username: string;
  password: string;
}

export interface LoginUseCase {
  execute(input: LoginUseCaseInput): Promise<AuthResponseDTO>;
}

export class Login implements LoginUseCase {
  constructor(
    private userLoginRepository: UserLoginRepository,
    private userRepository: UserRepository
  ) {}

  async execute(data: LoginUserDTO): Promise<AuthResponseDTO> {
    const { username, password } = data;

    const userLogin = await this.userLoginRepository.findByUsername(username);

    if (!userLogin) {
      throw new Error("Invalid credentials");
    }

    if (!userLogin.status) {
      throw new Error("Account is disabled");
    }

    const isPasswordValid = await compare(password, userLogin.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const user = await this.userRepository.findByLoginId(userLogin.login_id!);

    if (!user) {
      throw new Error("User profile not found");
    }

    const token = sign(
      {
        sub: userLogin.login_id,
        username: userLogin.username,
        userId: user.id,
      },
      getEnv().JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        login_id: userLogin.login_id!,
        username: userLogin.username,
        status: userLogin.status,
      },
    };
  }
}
