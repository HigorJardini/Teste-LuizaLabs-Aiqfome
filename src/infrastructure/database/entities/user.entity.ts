import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OrderTypeORMEntity } from "@database-entities";

@Entity("users")
export class UserTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "user_id", type: "int" })
  user_id?: number;

  @Column({ name: "name", type: "varchar", length: 255 })
  name?: string;

  @OneToMany(
    () => OrderTypeORMEntity,
    (order: OrderTypeORMEntity) => order.user
  )
  orders?: OrderTypeORMEntity[];
}
