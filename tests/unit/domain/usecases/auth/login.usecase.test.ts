import { LoginUseCase } from "../../../../../src/domain/usecases/auth/login.usecase";
import {
  LoginUserDTO,
  AuthResponseDTO,
} from "../../../../../src/application/dtos/auth.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { getEnv } from "../../../../../src/utils/shared/config/env";

// Mock das dependências externas
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../../../../src/utils/shared/config/env", () => ({
  getEnv: jest.fn(),
}));

describe("LoginUseCase", () => {
  const mockUserLoginRepository = {
    findByUsername: jest.fn(),
  };

  const useCase = new LoginUseCase(mockUserLoginRepository as any);

  beforeEach(() => {
    jest.clearAllMocks();
    (getEnv as jest.Mock).mockReturnValue({ JWT_SECRET: "test-secret" });
  });

  it("should authenticate user and return token", async () => {
    // Arrange
    const mockUser = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: true,
    };

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "password123",
    };

    const mockToken = "jwt-token-123";

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    // Act
    const result = await useCase.execute(loginDto);

    // Assert
    expect(result).toEqual({
      token: mockToken,
      user: {
        login_id: 1,
        username: "testuser",
        status: true,
      },
    });

    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "testuser"
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashed_password"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 1, username: "testuser" },
      "test-secret",
      { expiresIn: "1d" }
    );
  });

  it("should throw error if user does not exist", async () => {
    // Arrange
    mockUserLoginRepository.findByUsername.mockResolvedValue(null);

    const loginDto: LoginUserDTO = {
      username: "nonexistent",
      password: "password123",
    };

    // Act & Assert
    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "Invalid credentials"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "nonexistent"
    );
  });

  it("should throw error if account is disabled", async () => {
    // Arrange
    const mockUser = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: false, // Conta desativada
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUser);

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "password123",
    };

    // Act & Assert
    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "Account is disabled"
    );
  });

  it("should throw error if password is invalid", async () => {
    // Arrange
    const mockUser = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: true,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Senha inválida

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "wrong_password",
    };

    // Act & Assert
    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "Invalid credentials"
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrong_password",
      "hashed_password"
    );
  });
});
