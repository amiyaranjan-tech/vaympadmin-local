import { useState } from "react";

export function useProductState() {
  // Primary Filters
  const [productId, setProductId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [sellerId, setSellerId] = useState("all");

  // Advanced Filters
  const [brand, setBrand] = useState("all");
  const [size, setSize] = useState("all");
  const [gender, setGender] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [color, setColor] = useState("all");
  const [material, setMaterial] = useState("all");
  const [newArrival, setNewArrival] = useState("all");
  const [discount, setDiscount] = useState("all");

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
    subcategory,
    sellerId,
    brand,
    size,
    gender,
    stockStatus,
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
    setSubcategory,
    setSellerId,
    setBrand,
    setSize,
    setGender,
    setStockStatus,
    setColor,
    setMaterial,
    setNewArrival,
    setDiscount,
    setMinPrice,
    setMaxPrice,
    setDateAdded,
  };
}
