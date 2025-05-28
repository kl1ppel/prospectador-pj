import { Input } from 'read-excel-file';
import { ParsedObjectsResult } from 'read-excel-file/types';

export const parseExcelFile = async (file: File): Promise<string[]> => {
  const result = await readXlsxFile(file);
  return result.map(row => row[0].toString());
};
