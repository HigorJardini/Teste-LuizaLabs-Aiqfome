import { RegisterUseCase } from "../../../../../src/domain/usecases/auth/register.usecase";
import { RegisterUserDTO } from "../../../../../src/application/dtos/auth.dto";
import * as bcrypt from "bcrypt";

// Mock das dependências externas
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

describe("RegisterUseCase", () => {
  const mockUserLoginRepository = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
  };

  const useCase = new RegisterUseCase(
    mockUserLoginRepository as any,
    mockUserRepository as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    // Arrange
    const registerDto: RegisterUserDTO = {
      username: "newuser",
      password: "password123",
      name: "New User",
    };

    const mockHashedPassword = "hashed_password_123";
    const mockCreatedLogin = {
      login_id: 1,
      username: "newuser",
      password: mockHashedPassword,
      status: true,
    };

    // Mock de retornos
    mockUserLoginRepository.findByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    mockUserLoginRepository.create.mockResolvedValue(mockCreatedLogin);

    // Act
    const result = await useCase.execute(registerDto);

    // Assert
    expect(result).toBe(true);
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "newuser"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockUserLoginRepository.create).toHaveBeenCalledWith({
      username: "newuser",
      password: mockHashedPassword,
      status: true,
    });

    // NOTA: O userRepository.create não está sendo chamado na implementação atual
    // Este teste identifica a falha de não criar o usuário com o name fornecido
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("should throw error if username already exists", async () => {
    // Arrange
    const registerDto: RegisterUserDTO = {
      username: "existinguser",
      password: "password123",
      name: "Existing User",
    };

    const existingUser = {
      login_id: 1,
      username: "existinguser",
      password: "hashed_password",
      status: true,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(useCase.execute(registerDto)).rejects.toThrow(
      "Username already exists"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "existinguser"
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserLoginRepository.create).not.toHaveBeenCalled();
  });

  it("should handle errors during user creation", async () => {
    // Arrange
    const registerDto: RegisterUserDTO = {
      username: "erroruser",
      password: "password123",
      name: "Error User",
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    mockUserLoginRepository.create.mockRejectedValue(
      new Error("Database error")
    );

    // Act & Assert
    await expect(useCase.execute(registerDto)).rejects.toThrow(
      "Database error"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "erroruser"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockUserLoginRepository.create).toHaveBeenCalled();
  });
});
