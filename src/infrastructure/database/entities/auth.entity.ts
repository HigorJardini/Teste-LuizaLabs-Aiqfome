import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("userlogins")
export class UserLoginTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "login_id", type: "bigint" })
  login_id?: number;

  @Column({ name: "username", type: "varchar", length: 255 })
  username?: string;

  @Column({ name: "password", type: "varchar", length: 255 })
  password?: string;

  @Column({ name: "status", type: "boolean" })
  status?: boolean;

  @CreateDateColumn({ name: "created_at" })
  created_at?: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at?: Date;
}
