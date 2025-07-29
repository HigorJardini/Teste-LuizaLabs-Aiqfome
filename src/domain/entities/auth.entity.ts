export interface UserLoginEntity {
  login_id?: number;
  username: string;
  password: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
}
