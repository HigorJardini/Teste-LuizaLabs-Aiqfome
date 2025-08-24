import { Login } from "../../../../../src/domain/usecases/auth/login.usecase";
import { LoginUserDTO } from "../../../../../src/application/dtos/auth.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("Login UseCase", () => {
  const mockUserLoginRepository = {
    findByUsername: jest.fn(),
  };

  const mockUserRepository = {
    findByLoginId: jest.fn(),
  };

  const useCase = new Login(
    mockUserLoginRepository as any,
    mockUserRepository as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate user and return token with user data", async () => {
    const mockUserLogin = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: true,
    };

    const mockUserProfile = {
      id: 5,
      name: "Test User",
      email: "test@example.com",
      login_id: 1,
    };

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "password123",
    };

    const mockToken = "jwt-token-123";

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUserLogin);
    mockUserRepository.findByLoginId.mockResolvedValue(mockUserProfile);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await useCase.execute(loginDto);

    expect(result).toEqual({
      token: mockToken,
      user: {
        id: 5,
        name: "Test User",
        email: "test@example.com",
        login_id: 1,
        username: "testuser",
        status: true,
      },
    });

    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "testuser"
    );
    expect(mockUserRepository.findByLoginId).toHaveBeenCalledWith(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashed_password"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 1, username: "testuser", userId: 5 },
      expect.any(String),
      { expiresIn: "1d" }
    );
  });

  it("should throw error if user does not exist", async () => {
    mockUserLoginRepository.findByUsername.mockResolvedValue(null);

    const loginDto: LoginUserDTO = {
      username: "nonexistent",
      password: "password123",
    };

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "Invalid credentials"
    );
    expect(mockUserLoginRepository.findByUsername).toHaveBeenCalledWith(
      "nonexistent"
    );
  });

  it("should throw error if account is disabled", async () => {
    const mockUser = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: false,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUser);

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "password123",
    };

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "Account is disabled"
    );
  });

  it("should throw error if password is invalid", async () => {
    const mockUser = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: true,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "wrong_password",
    };

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "Invalid credentials"
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrong_password",
      "hashed_password"
    );
  });

  it("should throw error if user profile not found", async () => {
    const mockUserLogin = {
      login_id: 1,
      username: "testuser",
      password: "hashed_password",
      status: true,
    };

    mockUserLoginRepository.findByUsername.mockResolvedValue(mockUserLogin);
    mockUserRepository.findByLoginId.mockResolvedValue(null);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const loginDto: LoginUserDTO = {
      username: "testuser",
      password: "password123",
    };

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      "User profile not found"
    );
    expect(mockUserRepository.findByLoginId).toHaveBeenCalledWith(1);
  });
});
