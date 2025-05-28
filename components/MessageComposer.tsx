import React, { ChangeEvent } from 'react';

interface MessageComposerProps {
  baseMessage: string;
  setBaseMessage: (message: string) => void;
  isComposing: boolean;
  setIsComposing: (isComposing: boolean) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ baseMessage, setBaseMessage }) => {
  return (
    <textarea
      value={baseMessage}
      onChange={(e) => setBaseMessage(e.target.value)}
      placeholder="Digite sua mensagem base aqui..."
      rows={5}
      className="w-full px-3 py-2 border border-accent rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm resize-y text-neutral placeholder:text-gray-400"
      aria-label="Editor da mensagem base"
    />
  );
};