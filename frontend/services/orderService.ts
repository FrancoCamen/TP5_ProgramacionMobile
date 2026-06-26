import { api } from '@/services/api';
import { mapOrder } from '@/services/mappers';
import type { StrapiListResponse, StrapiSingleResponse } from '@/types/api';
import type {
  CreateOrderItem,
  Order,
  OrderAttributes,
} from '@/types/order';

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data } =
      await api.get<StrapiListResponse<OrderAttributes>>('/orders');

    return data.data.map(mapOrder);
  },

  async create(items: CreateOrderItem[]): Promise<Order> {
    const { data } = await api.post<StrapiSingleResponse<OrderAttributes>>(
      '/orders',
      { data: { items } }
    );

    return mapOrder(data.data);
  },
};
