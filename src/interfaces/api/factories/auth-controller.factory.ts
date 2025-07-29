import { AuthController } from "@controllers";
import { RegisterUseCase } from "@usecases";
import { LoginUseCase } from "@usecases";
import { TypeORMUserLoginRepository } from "@database-repositories";
import { TypeORMUserRepository } from "@database-repositories";

export class AuthFactory {
  static makeAuthController(): AuthController {
    const userLoginRepository = new TypeORMUserLoginRepository();
    const userRepository = new TypeORMUserRepository();

    const registerUseCase = new RegisterUseCase(
      userLoginRepository,
      userRepository
    );
    const loginUseCase = new LoginUseCase(userLoginRepository);

    return new AuthController(registerUseCase, loginUseCase);
  }
}
