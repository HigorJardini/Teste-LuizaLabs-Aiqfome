export interface RegisterUserDTO {
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface LoginUserDTO {
  username: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    login_id: number;
    username: string;
    status: boolean;
  };
}
