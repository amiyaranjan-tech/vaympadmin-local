import api from "./axios";

import type {
  CreateProductRequest,
  Product,
  ProductApiResponse,
  ProductListResponse,
  ProductQueryParams,
  ProductStatusRequest,
  UpdateProductRequest,
} from "@/types/product";

/**
 * Product API
 */
const productApi = {
  /**
   * ==========================================
   * Get Products
   * ==========================================
   */
  getAll: async (
    params?: ProductQueryParams,
  ): Promise<ProductApiResponse<ProductListResponse>> => {
    const response = await api.get<ProductApiResponse<ProductListResponse>>(
      "/products",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get Product By ID
   * ==========================================
   */
  getById: async (id: string): Promise<ProductApiResponse<Product>> => {
    const response = await api.get<ProductApiResponse<Product>>(
      `/products/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Create Product
   * ==========================================
   */
  create: async (
    payload: CreateProductRequest,
  ): Promise<ProductApiResponse<Product>> => {
    const response = await api.post<ProductApiResponse<Product>>(
      "/products",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Product
   * ==========================================
   */
  update: async (
    id: string,
    payload: UpdateProductRequest,
  ): Promise<ProductApiResponse<Product>> => {
    const response = await api.put<ProductApiResponse<Product>>(
      `/products/${id}`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Product
   * ==========================================
   */
  delete: async (id: string): Promise<ProductApiResponse<null>> => {
    const response = await api.delete<ProductApiResponse<null>>(
      `/products/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Product Status
   * ==========================================
   */
  updateStatus: async (
    id: string,
    payload: ProductStatusRequest,
  ): Promise<ProductApiResponse<Product>> => {
    const response = await api.patch<ProductApiResponse<Product>>(
      `/products/${id}/status`,
      payload,
    );

    return response.data;
  },
};

export default productApi;
