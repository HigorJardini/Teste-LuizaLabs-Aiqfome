import { UserLoginRepository } from "@repositories-entities";
import { LoginUserDTO, AuthResponseDTO } from "@dtos";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { getEnv } from "@config/env";

export class LoginUseCase {
  constructor(private userLoginRepository: UserLoginRepository) {}

  async execute(data: LoginUserDTO): Promise<AuthResponseDTO> {
    const { username, password } = data;

    const user = await this.userLoginRepository.findByUsername(username);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.status) {
      throw new Error("Account is disabled");
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = sign(
      { sub: user.login_id, username: user.username },
      getEnv().JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        login_id: user.login_id!,
        username: user.username,
        status: user.status,
      },
    };
  }
}
