import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { OrderTypeORMEntity } from "@database-entities";

@Entity("products")
export class ProductTypeORMEntity {
  @PrimaryColumn({ name: "product_id" })
  product_id?: number;

  @Column({ name: "value", type: "decimal", precision: 10, scale: 2 })
  value?: number;

  @Column({ name: "order_id" })
  order_id?: number;

  @ManyToOne(() => OrderTypeORMEntity, (order) => order.products)
  @JoinColumn({ name: "order_id" })
  order?: OrderTypeORMEntity;
}
