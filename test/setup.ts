import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';
import { AuthContext, AuthContextType, User } from '../src/contexts/AuthContext';

import '@testing-library/jest-dom/vitest';
import React from 'react';

// Setup JSDOM environment
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
});

// Set up global DOM objects
global.window = dom.window as any;
global.document = window.document;

// Mock navigator with required properties
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
    language: 'en-US',
  },
  writable: true
});

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock AuthProvider for tests
export interface TestAuthProviderProps {
  children: React.ReactNode;
  user?: User | null;
}


export const TestAuthProvider: React.FC<TestAuthProviderProps> = ({ children, user = null }) => {
  const defaultValue: AuthContextType = {
    user,
    loading: false,
    login: vi.fn().mockResolvedValue(true),
    register: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    resetPassword: vi.fn().mockResolvedValue(true),
    updatePassword: vi.fn().mockResolvedValue(true),
    error: null
  };


  return React.createElement(
    AuthContext.Provider,
    { value: defaultValue },
    children
  );
};

// Custom render with auth context
export const renderWithAuth = (
  ui: React.ReactElement,
  { user = null, ...options } = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => React.createElement(
      TestAuthProvider,
      { user, children },
      null
    ),
    ...options
  });
};

// Start the mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers between tests
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => server.close());

// Mock Blob implementation
global.Blob = class MockBlob {
  constructor(public parts: BlobPart[], public options: BlobPropertyBag) {}
  stream() {
    return new ReadableStream();
  }
} as any;

// Mock File API
global.File = class MockFile extends Blob {
  name: string;
  lastModified: number;
  constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
    super(parts, options);
    this.name = name;
    this.lastModified = Date.now();
  }
} as any;

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
