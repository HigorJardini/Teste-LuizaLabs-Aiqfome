import { GetOrdersUseCase } from "../../../../../src/domain/usecases/order/get-orders.usecase";
import { OrderFiltersDTO } from "../../../../../src/application/dtos/order.dto";

describe("GetOrdersUseCase", () => {
  const mockOrderRepository = {
    findAll: jest.fn(),
  };

  const mockProductRepository = {
    findByOrderTableId: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
  };

  const useCase = new GetOrdersUseCase(
    mockOrderRepository as any,
    mockProductRepository as any,
    mockUserRepository as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return orders with products and user data", async () => {
    // Mock data
    const mockOrders = [
      {
        id: 1,
        order_id: 844,
        purchase_date: new Date("2021-06-20"),
        total: 100.5,
        user_table_id: 1,
        upload_id: 1,
        user: {
          id: 1,
          user_id: 90,
          name: "Test User",
        },
      },
    ];

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

    const mockUser = {
      id: 1,
      user_id: 90,
      name: "Test User",
    };

    mockOrderRepository.findAll.mockResolvedValue({
      orders: mockOrders,
      count: 1,
    });

    mockProductRepository.findByOrderTableId.mockResolvedValue(mockProducts);
    mockUserRepository.findById.mockResolvedValue(mockUser);

    mockUserRepository.findByUserId.mockResolvedValue(mockUser);

    const filters: OrderFiltersDTO = { page: 1, limit: 10 };
    const result = await useCase.execute(filters);

    expect(result.orders).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.orders[0].order_id).toBe(844);
    expect(result.orders[0].products).toHaveLength(2);
    expect(result.orders[0].user?.name).toBe("Test User");

    expect(mockOrderRepository.findAll).toHaveBeenCalledWith(filters);
    expect(mockProductRepository.findByOrderTableId).toHaveBeenCalledWith(1);

    expect(mockUserRepository.findByUserId).toHaveBeenCalled();
  });
});
