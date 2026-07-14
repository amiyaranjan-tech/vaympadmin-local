import { ChangeEvent, useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { Product } from "../types";

export function useExcel(products: Product[]) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;

        const workbook = XLSX.read(data, {
          type: "binary",
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        console.log("Imported Products:", rows);

        /**
         * TODO:
         *
         * Convert Excel rows into Product[]
         *
         * Example:
         *
         * const importedProducts: Product[] = rows.map((row) => ({
         *   id: crypto.randomUUID(),
         *   name: String(row.Name),
         *   brand: String(row.Brand),
         *   category: String(row.Category),
         *   ...
         * }));
         *
         * Then update your products state from Products.tsx.
         */

        toast.success(`${rows.length} products imported successfully`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to import file");
      }
    };

    reader.readAsBinaryString(file);

    event.target.value = "";
  };

  const handleExport = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(products);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "products.xlsx");

      toast.success("Products exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export products");
    }
  };

  return {
    fileInputRef,
    handleImport,
    handleExport,
  };
}
