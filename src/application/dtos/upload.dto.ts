export interface FileUploadDTO {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

export interface UploadResponseDTO {
  upload_id: number;
  filename: string;
  uploaded_at: Date;
  processed_records: number;
}
