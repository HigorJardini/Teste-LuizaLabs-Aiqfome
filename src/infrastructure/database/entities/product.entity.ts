import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OrderTypeORMEntity } from "@database-entities";

@Entity("products")
export class ProductTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "product_id" })
  product_id?: number;

  @Column({ name: "value", type: "decimal", precision: 10, scale: 2 })
  value?: number;

  @Column({ name: "order_id" })
  order_id?: number;

  @ManyToOne(() => OrderTypeORMEntity)
  @JoinColumn({ name: "order_id" })
  order?: OrderTypeORMEntity;
}
