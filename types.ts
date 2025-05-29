
export interface PhoneNumber {
  id: string;
  number: string;
  formattedNumber: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  message?: string;
  timestamp?: string;
  length: number;
  replace: (pattern: string, replacement: string) => string;
}

export interface PhoneGroup {
  id: string;
  name: string;
  phoneNumbers: PhoneNumber[];
}

export type FileFormat = 'excel' | 'csv' | 'txt';

export interface FileParser {
  (file: File): Promise<string[]>;
}

export interface Session {
  phoneNumbers: PhoneNumber[];
  phoneGroups: PhoneGroup[];
  messages: string[];
  lastUpdated: string;
}

export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  data?: Record<string, any>;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

// Define API URL type
// Define API URL type
export type APIConfig = {
  url: string;
};

export const API_CONFIG: APIConfig = {
  url: 'http://localhost:3000'
};



