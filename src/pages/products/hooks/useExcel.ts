import { ChangeEvent, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import productService from "@/services/product.service";

import type { Seller } from "@/types/seller";
import { Product } from "../types";
import { excelRowToPayload, productToExcelRow } from "../product.excel";

export function useExcel(
  products: Product[],
  sellers: Seller[],
  onImported: () => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;

        const workbook = XLSX.read(data, { type: "binary" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (rows.length === 0) {
          toast.error("The file has no rows to import");
          return;
        }

        setImporting(true);

        let created = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i += 1) {
          const rowNumber = i + 2; // header row is row 1

          const { payload, error } = excelRowToPayload(rows[i], rowNumber, sellers);

          if (error) {
            errors.push(`Row ${rowNumber}: ${error}`);
            continue;
          }

          try {
            // eslint-disable-next-line no-await-in-loop
            await productService.create(payload!);
            created += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create";
            errors.push(`Row ${rowNumber}: ${message}`);
          }
        }

        if (created > 0) {
          toast.success(`${created} product(s) imported successfully`);
          onImported();
        }

        if (errors.length > 0) {
          console.error("Import errors:", errors);
          toast.error(
            `${errors.length} row(s) failed — see console for details`,
          );
        }

        if (created === 0 && errors.length === 0) {
          toast.error("No valid rows found in the file");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to read the file");
      } finally {
        setImporting(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    try {
      const rows = products.map((product) => productToExcelRow(product, sellers));

      const worksheet = XLSX.utils.json_to_sheet(rows);

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
    importing,
    handleImport,
    handleExport,
  };
}
