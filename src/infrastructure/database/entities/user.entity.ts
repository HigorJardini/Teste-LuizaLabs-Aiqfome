import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
export class UserTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "user_id", type: "int" })
  user_id?: number;

  @Column({ name: "name", type: "varchar", length: 255 })
  name?: string;
}
