import { UploadController } from "@controllers";
import { ProcessFileUseCase } from "@usecases";
import {
  TypeORMUploadRepository,
  TypeORMOrderRepository,
  TypeORMProductRepository,
  TypeORMUserRepository,
} from "@database-repositories";

export function makeUploadController(): UploadController {
  const uploadRepository = new TypeORMUploadRepository();
  const orderRepository = new TypeORMOrderRepository();
  const productRepository = new TypeORMProductRepository();
  const userRepository = new TypeORMUserRepository();

  const processFileUseCase = new ProcessFileUseCase(
    uploadRepository,
    orderRepository,
    productRepository,
    userRepository
  );

  return new UploadController(processFileUseCase);
}
