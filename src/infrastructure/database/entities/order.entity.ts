import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { UserTypeORMEntity } from "@database-entities";
import { UploadTypeORMEntity } from "@database-entities";
import { ProductTypeORMEntity } from "@database-entities";

@Entity("orders")
@Index("idx_order_business_order_id", ["order_id"], { unique: true })
@Index("idx_order_business_user_table_id", ["user_table_id"], { unique: true })
export class OrderTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id?: number;

  @Column({ name: "order_id" })
  order_id?: number;

  @Column({ name: "purchase_date", type: "date" })
  purchase_date?: Date;

  @Column({ name: "total", type: "decimal", precision: 10, scale: 2 })
  total?: number;

  @Column({ name: "user_table_id" })
  user_table_id?: number;

  @Column({ name: "upload_id" })
  upload_id?: number;

  @ManyToOne(() => UserTypeORMEntity)
  @JoinColumn({ name: "user_table_id" })
  user?: UserTypeORMEntity;

  @ManyToOne(() => UploadTypeORMEntity)
  @JoinColumn({ name: "upload_id" })
  upload?: UploadTypeORMEntity;

  @OneToMany(() => ProductTypeORMEntity, (product) => product.order)
  products?: ProductTypeORMEntity[];
}
