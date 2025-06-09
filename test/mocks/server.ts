import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API handlers
const handlers = [
  http.post('/api/upload', async () => {
    return HttpResponse.json({ 
      success: true,
      message: 'File uploaded successfully'
    });
  }),

  http.get('/api/files', async () => {
    return HttpResponse.json([
      { id: 1, name: 'test1.txt' },
      { id: 2, name: 'test2.txt' }
    ]);
  })
];

export const server = setupServer(...handlers);
