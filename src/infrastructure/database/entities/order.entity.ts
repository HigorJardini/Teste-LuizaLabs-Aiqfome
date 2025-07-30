import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { UserTypeORMEntity } from "@database-entities";
import { UploadTypeORMEntity } from "@database-entities";
import { ProductTypeORMEntity } from "@database-entities";

@Entity("orders")
export class OrderTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "order_id" })
  order_id?: number;

  @Column({ name: "purchase_date", type: "date" })
  purchase_date?: Date;

  @Column({ name: "total", type: "decimal", precision: 10, scale: 2 })
  total?: number;

  @Column({ name: "user_id" })
  user_id?: number;

  @Column({ name: "upload_id" })
  upload_id?: number;

  @ManyToOne(() => UserTypeORMEntity)
  @JoinColumn({ name: "user_id" })
  user?: UserTypeORMEntity;

  @ManyToOne(() => UploadTypeORMEntity)
  @JoinColumn({ name: "upload_id" })
  upload?: UploadTypeORMEntity;

  @OneToMany(() => ProductTypeORMEntity, (product) => product.order)
  products?: ProductTypeORMEntity[];
}
