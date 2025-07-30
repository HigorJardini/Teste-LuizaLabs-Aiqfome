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
      const parts = request.parts();

      const results = [];
      let processedFiles = 0;
      let errorFiles = 0;

      for await (const part of parts) {
        if (part.type === "file") {
          try {
            console.log(`Processing file: ${part.filename}`);

            const fileUpload: FileUploadDTO = {
              filename: part.filename || "upload.txt",
              buffer: await part.toBuffer(),
              mimetype: part.mimetype || "text/plain",
            };

            if (
              !fileUpload.mimetype.includes("text") &&
              !fileUpload.mimetype.includes("csv") &&
              !fileUpload.mimetype.includes("octet-stream")
            ) {
              console.error(`Invalid file type: ${fileUpload.mimetype}`);
              errorFiles++;
              continue;
            }

            const result = await this.processFileUseCase.execute(
              fileUpload,
              loginId
            );
            results.push(result);
            processedFiles++;
          } catch (error) {
            console.error(`Error processing file ${part.filename}:`, error);
            errorFiles++;
          }
        }
      }

      if (processedFiles === 0 && errorFiles > 0) {
        reply.status(400).send({
          message: "Failed to process any files. Please check file formats.",
          processed: 0,
          errors: errorFiles,
        });
        return;
      }

      reply.status(201).send({
        message: `Successfully processed ${processedFiles} files${errorFiles > 0 ? `, ${errorFiles} failed` : ""}`,
        processed: processedFiles,
        errors: errorFiles,
        files: results,
      });
    } catch (error: any) {
      console.error("Error processing files:", error);
      reply.status(500).send({ message: "Error processing files" });
    }
  }
}
