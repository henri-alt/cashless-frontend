import * as xlsx from "xlsx";
import { ItemConfig } from "@/types";

type ItemsFileData = {
  [index: string]: number | string;
  Tax: number;
  Price: number;
  Category: string;
  ["Item Name"]: string;
  ["Staff Price"]: string;
};

const keyMap: Record<string, string> = {
  Tax: "itemTax",
  Price: "itemPrice",
  Category: "itemCategory",
  ["Item Name"]: "itemName",
  ["Staff Price"]: "staffPrice",
};

export async function excelParser(file: File) {
  const data = await file.arrayBuffer();
  const workbook = xlsx.read(data);
  let items: Array<ItemConfig> = [];

  for (const sheetName of workbook.SheetNames) {
    const sheetData: Array<ItemsFileData> = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );
    items = sheetData.map((el) => {
      const newObj = {};
      for (let i = 0; i < Object.keys(el).length; i++) {
        const key = Object.keys(el)[i];
        Object.assign(newObj, { [keyMap[key]]: el[key] });
      }
      return newObj as ItemConfig;
    });
  }

  return items;
}
