import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import FileTransfer from '../components/FileTransfer';
import { firebaseTransferService } from '../src/firebase/transferService';
import { renderWithAuth } from './setup';

// Mock the transfer service
vi.mock('../src/firebase/transferService', () => ({
  firebaseTransferService: {
    uploadFile: vi.fn(() => Promise.resolve({ success: true })),
    onItemsUpdate: vi.fn(() => () => {}),
    addTransferItem: vi.fn().mockResolvedValue({ success: true }),
    deleteTransferItem: vi.fn().mockResolvedValue({ success: true }),
    downloadFile: vi.fn().mockResolvedValue({ 
      success: true,
      blob: new Blob(['test']),
      fileName: 'test.txt'
    })
  }
}));

const mockUser = {
  uid: '123',
  id: '123',
  email: 'test@example.com',
  emailVerified: true
};

const server = setupServer(
  http.post('/api/upload', () => {
    return HttpResponse.json({ success: true });
  })
);

describe('FileTransfer Component', () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    server.resetHandlers();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return renderWithAuth(
      <BrowserRouter>
        <FileTransfer />
      </BrowserRouter>,
      { user: mockUser }
    );
  };

  afterAll(() => {
    server.close();
  });

  it('should show upload progress for valid files', async () => {
    const mockUpload = vi.fn().mockImplementation((file, userId, onProgress) => {
      setTimeout(() => onProgress({ progress: 50, fileName: file.name }), 100);
      setTimeout(() => onProgress({ progress: 100, fileName: file.name }), 200);
      return Promise.resolve(() => {});
    });
    
    vi.mocked(firebaseTransferService.uploadFile).mockImplementation(mockUpload);
    
    renderComponent();
    
    const input = screen.getByLabelText(/select file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByTestId('upload-progress')).toHaveTextContent('50%');
    });
    
    await waitFor(() => {
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });
  });

  it('should handle download click', async () => {
    renderComponent();
    
    const downloadButton = screen.getByTestId('download-button');
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(firebaseTransferService.downloadFile).toHaveBeenCalled();
    });
  });

  it('should handle upload errors', async () => {
    const mockUpload = vi.fn().mockImplementation((file, userId, onProgress) => {
      setTimeout(() => onProgress({ 
        progress: 0, 
        error: new Error('Upload failed'), 
        fileName: file.name 
      }), 100);
      return Promise.resolve(() => {});
    });
    
    vi.mocked(firebaseTransferService.uploadFile).mockImplementation(mockUpload);
    
    renderComponent();
    
    const input = screen.getByLabelText(/select file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Upload failed');
    });
  });

  it('should verify metadata validation', async () => {
    const mockUpload = vi.fn().mockImplementation((file, userId, onProgress) => {
      setTimeout(() => onProgress({ 
        progress: 0, 
        error: new Error('Metadata validation failed'), 
        fileName: file.name 
      }), 100);
      return Promise.resolve(() => {});
    });
    
    vi.mocked(firebaseTransferService.uploadFile).mockImplementation(mockUpload);
    
    renderComponent();
    
    const input = screen.getByLabelText(/select file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/metadata validation failed/i)).toBeInTheDocument();
    });
  });
});
