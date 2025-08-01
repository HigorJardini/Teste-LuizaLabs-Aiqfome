import { ProcessFileUseCase } from "../../../../../src/domain/usecases/upload/process-file.usecase";
import { FileUploadDTO } from "../../../../../src/application/dtos/upload.dto";
import { FileParser } from "../../../../../src/utils/shared/parsers/file-parser";

jest.mock("../../../../../src/utils/shared/parsers/file-parser", () => ({
  FileParser: {
    parseFixedWidthLine: jest.fn(),
  },
}));

describe("ProcessFileUseCase", () => {
  const mockUploadRepository = {
    create: jest.fn(),
  };

  const mockOrderRepository = {
    create: jest.fn(),
    findByOrderIdAndUserTableId: jest.fn(),
    updateTotal: jest.fn(),
  };

  const mockProductRepository = {
    create: jest.fn(),
    findByOrderTableId: jest.fn(),
    createMany: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    findByUserId: jest.fn(),
  };

  const useCase = new ProcessFileUseCase(
    mockUploadRepository as any,
    mockOrderRepository as any,
    mockProductRepository as any,
    mockUserRepository as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process file and create entities correctly", async () => {
    // Setup mock for upload
    const mockUpload = {
      upload_id: 1,
      filename: "test.txt",
      uploaded_at: new Date(),
    };
    mockUploadRepository.create.mockResolvedValue(mockUpload);

    // Setup mock for user
    const mockUser = {
      id: 1,
      user_id: 90,
      name: "Test User",
    };

    // Configuração correta dos mocks para findByUserId
    // A ordem é crucial aqui:
    mockUserRepository.findByUserId
      // Primeira chamada durante o loop de criação de usuários - verificar se existe
      .mockResolvedValueOnce(null)
      // Segunda chamada após criação do usuário - verificação
      .mockResolvedValueOnce(mockUser)
      // Terceira chamada antes de criar a ordem
      .mockResolvedValueOnce(mockUser);

    mockUserRepository.create.mockResolvedValue(mockUser);

    // Setup mock for order
    const mockOrder = {
      id: 1,
      order_id: 844,
      purchase_date: new Date("2021-06-20"),
      total: 100.5,
      user_table_id: 1,
      upload_id: 1,
    };
    mockOrderRepository.findByOrderIdAndUserTableId.mockResolvedValue(null);
    mockOrderRepository.create.mockResolvedValue(mockOrder);

    // Setup mock for products
    const mockProducts = [
      {
        id: 1,
        product_id: 123,
        value: 50.25,
        order_table_id: 1,
      },
      {
        id: 2,
        product_id: 456,
        value: 50.25,
        order_table_id: 1,
      },
    ];
    mockProductRepository.create.mockImplementation((product) => ({
      ...product,
      id: Math.floor(Math.random() * 1000),
    }));
    mockProductRepository.findByOrderTableId.mockResolvedValue(mockProducts);

    // Setup mock for FileParser
    const parsedRecord = {
      userId: 90,
      userName: "Test User",
      orderId: 844,
      purchaseDate: new Date("2021-06-20"),
      productId: 123,
      productValue: 50.25,
    };
    (FileParser.parseFixedWidthLine as jest.Mock).mockReturnValue(parsedRecord);

    // Create test file
    const file: FileUploadDTO = {
      filename: "test.txt",
      buffer: Buffer.from(
        "0000000090                          Test User                 I00000084400000000123      50.2520210620"
      ),
      mimetype: "text/plain",
    };

    // Execute use case
    const result = await useCase.execute(file, 1);

    // Assertions
    expect(result).toBeDefined();
    expect(result.upload_id).toBe(1);
    expect(result.filename).toBe("test.txt");
    expect(result.processed_records).toBe(1);

    // Verify repository calls
    expect(mockUploadRepository.create).toHaveBeenCalledWith({
      login_id: 1,
      filename: "test.txt",
    });

    // Verificar que findByUserId foi chamado pelo menos uma vez
    expect(mockUserRepository.findByUserId).toHaveBeenCalledWith(
      90,
      "Test User"
    );

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      user_id: 90,
      name: "Test User",
    });

    expect(mockOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 844,
        user_table_id: 1,
        upload_id: 1,
      })
    );

    expect(mockProductRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: 123,
        order_table_id: 1,
      })
    );

    expect(mockOrderRepository.updateTotal).toHaveBeenCalled();
  });
});
