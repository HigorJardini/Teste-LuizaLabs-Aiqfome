import { Register } from "../../../../../src/domain/usecases/auth/register.usecase";
import { RegisterUserDTO } from "../../../../../src/application/dtos/auth.dto";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

describe("Register UseCase", () => {
  const mockUserLoginRepository = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const useCase = new Register(
    mockUserLoginRepository as any,
    mockUserRepository as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const registerDto: RegisterUserDTO = {
      username: "newuser",
      password: "password123",
      name: "New User",
      email: "user@example.com",
    };

    const mockHashedPassword = "hashed_password_123";
    const mockCreatedLogin = {
      login_id: 1,
      username: "newuser",
      password: mockHashedPassword,
      status: true,
    };

    const mockCreatedUser = {
      id: 5,
      name: "New User",
      email: "user@example.com",
      login_id: 1,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    mockUserLoginRepository.create.mockResolvedValue(mockCreatedLogin);
    mockUserRepository.create.mockResolvedValue(mockCreatedUser);

    const result = await useCase.execute(registerDto);

    expect(result).toEqual({
      userId: 5,
      loginId: 1,
    });
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "newuser"
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "user@example.com"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockUserLoginRepository.create).toHaveBeenCalledWith({
      username: "newuser",
      password: mockHashedPassword,
      status: true,
    });
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      name: "New User",
      email: "user@example.com",
      login_id: 1,
    });
  });

  it("should throw error if username already exists", async () => {
    const registerDto: RegisterUserDTO = {
      username: "existinguser",
      password: "password123",
      name: "Existing User",
      email: "existing@example.com",
    };

    const existingUser = {
      login_id: 1,
      username: "existinguser",
      password: "hashed_password",
      status: true,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(existingUser);

    await expect(useCase.execute(registerDto)).rejects.toThrow(
      "Username already exists"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "existinguser"
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserLoginRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("should throw error if email already exists", async () => {
    const registerDto: RegisterUserDTO = {
      username: "newuser",
      password: "password123",
      name: "New User",
      email: "existing@example.com",
    };

    const existingProfile = {
      id: 1,
      name: "Existing User",
      email: "existing@example.com",
      login_id: 2,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(existingProfile);

    await expect(useCase.execute(registerDto)).rejects.toThrow(
      "Email already exists"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "newuser"
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "existing@example.com"
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserLoginRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("should handle errors during login creation", async () => {
    const registerDto: RegisterUserDTO = {
      username: "erroruser",
      password: "password123",
      name: "Error User",
      email: "error@example.com",
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    mockUserLoginRepository.create.mockRejectedValue(
      new Error("Database error")
    );

    await expect(useCase.execute(registerDto)).rejects.toThrow(
      "Database error"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "erroruser"
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "error@example.com"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockUserLoginRepository.create).toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("should handle errors during user profile creation", async () => {
    const registerDto: RegisterUserDTO = {
      username: "validuser",
      password: "password123",
      name: "Valid User",
      email: "valid@example.com",
    };

    const mockCreatedLogin = {
      login_id: 1,
      username: "validuser",
      password: "hashed_password",
      status: true,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    mockUserLoginRepository.create.mockResolvedValue(mockCreatedLogin);
    mockUserRepository.create.mockRejectedValue(
      new Error("Profile creation failed")
    );

    await expect(useCase.execute(registerDto)).rejects.toThrow(
      "Profile creation failed"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "validuser"
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "valid@example.com"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockUserLoginRepository.create).toHaveBeenCalled();
    expect(mockUserRepository.create).toHaveBeenCalled();
  });
});
