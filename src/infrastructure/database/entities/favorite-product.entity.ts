import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("favoriteproducts")
export class FavoriteProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  product_external_id!: number;

  @CreateDateColumn()
  added_at!: Date;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
