import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 border-t border-accent">
      <div className="flex items-center justify-center gap-2">
        <img 
          src="https://sdmntprwestus.oaiusercontent.com/files/00000000-eb60-6230-9b08-23f212e0af06/raw?se=2025-05-28T00%3A18%3A16Z&sp=r&sv=2024-08-04&sr=b&scid=4b7992be-8526-5b60-ad22-5358b2f0c41a&skoid=61180a4f-34a9-42b7-b76d-9ca47d89946d&sktid=a48cca56-e6da-484e-a814-9ca47d89946d&skt=2025-05-27T22%3A13%3A25Z&ske=2025-05-28T22%3A13%3A25Z&sks=b&skv=2024-08-04&sig=x2ceW3bqRe7eHYQUxWt6idXLOz18uzoRnzgjYYKqwpM%3D"
          alt="GPT-4"
          className="h-8 w-auto"
        />
      </div>
    </footer>
  );
};
