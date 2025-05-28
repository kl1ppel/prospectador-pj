import React, { useState } from 'react';
import { PlusIcon } from './icons';

import { PhoneNumber } from '../types';

interface PhoneNumberInputProps {
  onAddPhoneNumber: (number: PhoneNumber) => void;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ onAddPhoneNumber }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddPhoneNumber(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="tel"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Digite o número (ex: +55119...)"
        className="flex-grow px-4 py-2 border border-accent rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-basetone"
        aria-label="Número de telefone"
      />
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-neutral bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        aria-label="Adicionar número de telefone"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Adicionar
      </button>
    </form>
  );
};