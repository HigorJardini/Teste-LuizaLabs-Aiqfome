import { UserController, UserControllerImpl } from "@controllers";
import { GetProfile, UpdateProfile, DeleteProfile } from "@usecases";
import { TypeORMUserRepository } from "@database-repositories";

export class UserFactory {
  static makeUserController(): UserController {
    const userRepository = new TypeORMUserRepository();

    const getProfileUseCase = new GetProfile(userRepository);
    const updateProfileUseCase = new UpdateProfile(userRepository);
    const deleteProfileUseCase = new DeleteProfile(userRepository);

    return new UserControllerImpl(
      getProfileUseCase,
      updateProfileUseCase,
      deleteProfileUseCase
    );
  }
}
