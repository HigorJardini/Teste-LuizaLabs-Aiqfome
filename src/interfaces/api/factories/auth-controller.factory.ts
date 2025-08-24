import { AuthController, AuthControllerImpl } from "@controllers";
import { Register, Login } from "@usecases";
import {
  TypeORMUserLoginRepository,
  TypeORMUserRepository,
} from "@database-repositories";

export class AuthFactory {
  static makeAuthController(): AuthController {
    const userLoginRepository = new TypeORMUserLoginRepository();
    const userRepository = new TypeORMUserRepository();

    const registerUseCase = new Register(userLoginRepository, userRepository);

    const loginUseCase = new Login(userLoginRepository, userRepository);

    return new AuthControllerImpl(registerUseCase, loginUseCase);
  }
}
