import { UploadEntity } from "@entities";

export interface UploadRepository {
  create(upload: UploadEntity): Promise<UploadEntity>;
  findById(upload_id: number): Promise<UploadEntity | null>;
  findByLoginId(login_id: number): Promise<UploadEntity[]>;
}
