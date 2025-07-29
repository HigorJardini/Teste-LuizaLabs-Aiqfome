export interface RegisterUserDTO {
  username: string;
  password: string;
  name: string;
}

export interface LoginUserDTO {
  username: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    login_id: number;
    username: string;
    status: boolean;
  };
}
