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
  @PrimaryGeneratedColumn({ name: "id" })
  id?: number;

  @Column({ name: "product_id" })
  product_id?: number;

  @Column({ name: "value", type: "decimal", precision: 10, scale: 2 })
  value?: number;

  @Column({ name: "order_table_id" })
  order_table_id?: number;

  @ManyToOne(() => OrderTypeORMEntity, (order) => order.products)
  @JoinColumn({ name: "order_table_id" })
  order?: OrderTypeORMEntity;
}
