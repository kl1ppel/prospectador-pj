import { FileFormat } from '../types';

export const readCsvFile = async (file: File): Promise<string[]> => {
  const text = await file.text();
  const lines = text.split(/\r\n|\n/);
  return lines.map(line => line.trim());
};

export const readTxtFile = async (file: File): Promise<string[]> => {
  const text = await file.text();
  const lines = text.split(/\r\n|\n/);
  return lines.map(line => line.trim());
};
