
import React from 'react';

// All icons default to currentColor for stroke/fill unless specified otherwise
// This makes them inherit the text color of their parent, fitting the B&W theme.

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// CopyIcon removed
// CheckIcon removed

export const LoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// SparklesIcon removed

export const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  // fill="currentColor" allows it to inherit color, but it will be styled with explicit green in the button.
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 22L7.31 20.63C8.75 21.39 10.35 21.81 12.04 21.81C17.5 21.81 21.95 17.36 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 3.64C16.57 3.64 20.31 7.38 20.31 11.91C20.31 16.44 16.57 20.17 12.04 20.17C10.49 20.17 9.01 19.78 7.74 19.07L7.43 18.89L4.29 19.79L5.21 16.73L5.02 16.4C4.24 15.03 3.77 13.5 3.77 11.91C3.77 7.38 7.51 3.64 12.04 3.64M16.57 14.47C16.34 14.91 15.37 15.44 15.03 15.49C14.68 15.54 14.29 15.56 13.91 15.41C13.52 15.26 12.77 15 11.91 14.19C10.87 13.18 10.19 11.98 10.04 11.71C9.89 11.43 9.75 11.28 9.54 11.28C9.34 11.28 9.15 11.27 8.97 11.27C8.79 11.27 8.51 11.21 8.29 11.46C8.07 11.72 7.56 12.29 7.56 13.12C7.56 13.95 8.32 14.73 8.47 14.88C8.62 15.03 10.03 17.22 12.22 18.09C14.41 18.96 14.84 18.78 15.23 18.73C15.62 18.68 16.56 18.11 16.76 17.64C16.96 17.17 16.96 16.79 16.89 16.67C16.82 16.56 16.67 16.5 16.57 14.47Z" />
  </svg>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const ErrorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
