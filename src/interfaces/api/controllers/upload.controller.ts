import { FastifyRequest, FastifyReply } from "fastify";
import { ProcessFileUseCase } from "@usecases";
import { FileUploadDTO } from "@dtos";

export class UploadController {
  constructor(private processFileUseCase: ProcessFileUseCase) {}

  async uploadFile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const loginId = request.user.sub;

      const data = await request.file();
      if (!data) {
        reply.status(400).send({ message: "No file uploaded" });
        return;
      }

      const fileUpload: FileUploadDTO = {
        filename: data.filename || "upload.txt",
        buffer: await data.toBuffer(),
        mimetype: data.mimetype || "text/plain",
      };

      if (
        !fileUpload.mimetype.includes("text") &&
        !fileUpload.mimetype.includes("csv") &&
        !fileUpload.mimetype.includes("octet-stream")
      ) {
        reply.status(400).send({
          message: "Invalid file type. Expected text file.",
        });
        return;
      }

      const result = await this.processFileUseCase.execute(fileUpload, loginId);

      reply.status(201).send(result);
    } catch (error: any) {
      console.error("Error processing file:", error);

      if (error.message && error.message.includes("Invalid")) {
        reply.status(400).send({
          message: "Invalid file format. Please check the file structure.",
          error: error.message,
        });
        return;
      }

      reply.status(500).send({ message: "Error processing file" });
    }
  }
}
