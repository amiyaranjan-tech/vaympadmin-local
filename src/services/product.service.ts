import productApi from "@/api/product.api";

import type {
  CreateProductRequest,
  Product,
  ProductApiResponse,
  ProductListResponse,
  ProductQueryParams,
  ProductStatus,
  UpdateProductRequest,
} from "@/types/product";

class ProductService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: ProductApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Products
   * ==========================================
   */

  async getAll(params?: ProductQueryParams): Promise<ProductListResponse> {
    const response = await productApi.getAll(params);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Get Product By Id
   * ==========================================
   */

  async getById(id: string): Promise<Product> {
    const response = await productApi.getById(id);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Create Product
   * ==========================================
   */

  async create(payload: CreateProductRequest): Promise<Product> {
    const response = await productApi.create(payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Product
   * ==========================================
   */

  async update(id: string, payload: UpdateProductRequest): Promise<Product> {
    const response = await productApi.update(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Delete Product
   * ==========================================
   */

  async delete(id: string): Promise<void> {
    const response = await productApi.delete(id);

    this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Product Status
   * ==========================================
   */

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    const response = await productApi.updateStatus(id, {
      status,
    });

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Publish Product
   * ==========================================
   */

  publish(id: string): Promise<Product> {
    return this.updateStatus(id, "published");
  }

  /**
   * ==========================================
   * Unpublish Product
   * ==========================================
   */

  unpublish(id: string): Promise<Product> {
    return this.updateStatus(id, "draft");
  }
}

export default new ProductService();
