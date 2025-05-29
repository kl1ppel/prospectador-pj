import readXlsxFile from 'read-excel-file';

export const parseExcelFile = async (file: File): Promise<string[]> => {
  const result = await readXlsxFile(file);
  return result.map((row: any) => row[0].toString());
};
