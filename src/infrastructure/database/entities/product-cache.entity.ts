import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("productcache")
export class ProductCache {
  @PrimaryColumn()
  product_external_id!: number;

  @Column()
  title!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  image_url!: string;

  @Column({ nullable: true, type: "text" })
  description!: string;

  @Column({ nullable: true })
  category!: string;

  @Column("decimal", { precision: 3, scale: 2, nullable: true })
  rating_rate!: number;

  @Column({ nullable: true })
  rating_count!: number;

  @CreateDateColumn()
  last_updated!: Date;
}
