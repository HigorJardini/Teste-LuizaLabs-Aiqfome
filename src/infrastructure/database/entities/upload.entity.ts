import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserLoginTypeORMEntity } from "@database-entities";

@Entity("uploads")
export class UploadTypeORMEntity {
  @PrimaryGeneratedColumn({ name: "upload_id" })
  upload_id?: number;

  @Column({ name: "login_id" })
  login_id?: number;

  @Column({ name: "filename", nullable: true })
  filename?: string;

  @CreateDateColumn({ name: "uploaded_at" })
  uploaded_at?: Date;

  @ManyToOne(() => UserLoginTypeORMEntity)
  @JoinColumn({ name: "login_id" })
  userLogin?: UserLoginTypeORMEntity;
}
