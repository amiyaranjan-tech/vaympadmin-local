import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useProductState() {
  // Lets a deep link (e.g. the admin Deals page's Massive Deals "View
  // Products" link, /products?discount=50) pre-apply the discount filter
  // on load — read once; the URL isn't kept in sync after that (this page
  // doesn't URL-sync any other filter either).
  const [searchParams] = useSearchParams();
  const initialDiscount = searchParams.get("discount") ?? "all";

  // Primary Filters
  const [productId, setProductId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [group, setGroup] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [sellerId, setSellerId] = useState("all");

  // Advanced Filters
  const [brand, setBrand] = useState("all");
  const [size, setSize] = useState("all");
  const [gender, setGender] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [status, setStatus] = useState("all");
  const [color, setColor] = useState("all");
  const [material, setMaterial] = useState("all");
  const [newArrival, setNewArrival] = useState("all");
  const [discount, setDiscount] = useState(initialDiscount);

  // Price
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Date
  const [dateAdded, setDateAdded] = useState("all");

  return {
    // values
    productId,
    search,
    category,
    group,
    subcategory,
    sellerId,
    brand,
    size,
    gender,
    stockStatus,
    status,
    color,
    material,
    newArrival,
    discount,
    minPrice,
    maxPrice,
    dateAdded,

    // setters
    setProductId,
    setSearch,
    setCategory,
    setGroup,
    setSubcategory,
    setSellerId,
    setBrand,
    setSize,
    setGender,
    setStockStatus,
    setStatus,
    setColor,
    setMaterial,
    setNewArrival,
    setDiscount,
    setMinPrice,
    setMaxPrice,
    setDateAdded,
  };
}
