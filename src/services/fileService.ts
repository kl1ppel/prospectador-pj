import api from './api';

export const fileService = {
  upload: async (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      }
    });
    return response.data;
  },
  downloadUrl: (filename: string) => `${api.defaults.baseURL}/files/download/${filename}`
};
export default fileService;
