import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import productService from "@/services/product.service";

import type {
  CreateProductRequest,
  Product,
  ProductQueryParams,
  ProductStatus,
  UpdateProductRequest,
} from "@/types/product";

export default function useProducts(initialParams?: ProductQueryParams) {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  /**
   * ==========================================
   * Fetch Products
   * ==========================================
   */

  const fetchProducts = useCallback(
    async (params?: ProductQueryParams, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response = await productService.getAll({
          ...initialParams,
          ...params,
        });

        setProducts(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch products";

        setError(message);

        toast.error(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [initialParams],
  );

  /**
   * ==========================================
   * Refresh
   * ==========================================
   */

  const refresh = useCallback(async () => {
    await fetchProducts(undefined, true);
  }, [fetchProducts]);

  /**
   * ==========================================
   * Get Product
   * ==========================================
   */

  const getProduct = useCallback(async (id: string) => {
    return productService.getById(id);
  }, []);

  /**
   * ==========================================
   * Create Product
   * ==========================================
   */

  const createProduct = useCallback(async (payload: CreateProductRequest) => {
    try {
      const product = await productService.create(payload);

      toast.success("Product created successfully");

      setProducts((prev) => [product, ...prev]);

      setTotal((prev) => prev + 1);

      return product;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create product";

      toast.error(message);

      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Update Product
   * ==========================================
   */

  const updateProduct = useCallback(
    async (id: string, payload: UpdateProductRequest) => {
      try {
        const product = await productService.update(id, payload);

        toast.success("Product updated successfully");

        setProducts((prev) =>
          prev.map((item) => (item._id === product._id ? product : item)),
        );

        return product;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update product";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Delete Product
   * ==========================================
   */

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await productService.delete(id);

        toast.success("Product deleted successfully");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete product";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Update Product Status
   * ==========================================
   */

  const updateStatus = useCallback(
    async (id: string, status: ProductStatus) => {
      try {
        const product = await productService.updateStatus(id, status);

        toast.success("Product status updated");

        setProducts((prev) =>
          prev.map((item) => (item._id === product._id ? product : item)),
        );

        return product;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update product status";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Initial Load
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await productService.getAll(initialParams);

        if (cancelled) {
          return;
        }

        setError(null);

        setProducts(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch products";

        setError(message);

        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [initialParams]);

  return {
    products,

    loading,
    error,

    total,
    page,
    limit,
    totalPages,

    refresh,
    fetchProducts,

    getProduct,

    createProduct,
    updateProduct,
    deleteProduct,

    updateStatus,
  };
}
