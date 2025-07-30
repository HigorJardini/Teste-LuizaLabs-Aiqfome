import { UploadRepository } from "@repositories-entities";
import { UploadEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { UploadTypeORMEntity } from "@database-entities";

export class TypeORMUploadRepository implements UploadRepository {
  private repository = AppDataSource.getRepository(UploadTypeORMEntity);

  async create(upload: UploadEntity): Promise<UploadEntity> {
    const newUpload = this.repository.create(upload);
    const savedUpload = await this.repository.save(newUpload);

    return {
      upload_id: savedUpload.upload_id,
      login_id: savedUpload.login_id ?? 0,
      filename: savedUpload.filename,
      uploaded_at: savedUpload.uploaded_at,
    };
  }

  async findById(upload_id: number): Promise<UploadEntity | null> {
    const upload = await this.repository.findOne({ where: { upload_id } });
    if (!upload) return null;

    return {
      upload_id: upload.upload_id,
      login_id: upload.login_id ?? 0,
      filename: upload.filename,
      uploaded_at: upload.uploaded_at,
    };
  }

  async findByLoginId(login_id: number): Promise<UploadEntity[]> {
    const uploads = await this.repository.find({ where: { login_id } });

    return uploads.map((upload) => ({
      upload_id: upload.upload_id ?? 0,
      login_id: upload.login_id ?? 0,
      filename: upload.filename ?? "",
      uploaded_at: upload.uploaded_at ?? new Date(0),
    }));
  }
}
