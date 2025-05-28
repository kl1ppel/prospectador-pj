import React from 'react';

interface MessageComposerProps {
  baseMessage: string;
  setBaseMessage: (message: string) => void;
}

const GPT4Logo = () => (
  <div className="flex justify-end mt-2">
    <img 
      src="https://sdmntprwestus.oaiusercontent.com/files/00000000-eb60-6230-9b08-23f212e0af06/raw?se=2025-05-28T00%3A18%3A16Z&sp=r&sv=2024-08-04&sr=b&scid=4b7992be-8526-5b60-ad22-5358b2f0c41a&skoid=61180a4f-34a9-42b7-b76d-9ca47d89946d&sktid=a48cca56-e6da-484e-a814-9ca47d89946d&skt=2025-05-27T22%3A13%3A25Z&ske=2025-05-28T22%3A13%3A25Z&sks=b&skv=2024-08-04&sig=x2ceW3bqRe7eHYQUxWt6idXLOz18uzoRnzgjYYKqwpM%3D"
      alt="GPT-4"
      className="h-6 w-auto"
    />
  </div>
);

export const MessageComposer: React.FC<MessageComposerProps> = ({ baseMessage, setBaseMessage }) => {
  return (
    <div className="space-y-2">
      <textarea
        value={baseMessage}
        onChange={(e) => setBaseMessage(e.target.value)}
        placeholder="Digite sua mensagem base aqui..."
        rows={5}
        className="w-full px-3 py-2 border border-accent rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm resize-y placeholder:text-gray-400 bg-white text-black dark:bg-white dark:text-black dark:placeholder:text-gray-400"
        style={{ color: '#000000' }}
        aria-label="Editor da mensagem base"
      />
      <GPT4Logo />
    </div>
  );
};

export default MessageComposer;