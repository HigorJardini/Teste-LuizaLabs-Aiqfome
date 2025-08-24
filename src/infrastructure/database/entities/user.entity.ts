import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserLogin } from "@database-entities";
import { FavoriteProduct } from "./favorite-product.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  login_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(() => UserLogin)
  @JoinColumn({ name: "login_id" })
  login!: UserLogin;

  @OneToMany(() => FavoriteProduct, (favorite) => favorite.user)
  favorites!: FavoriteProduct[];
}
