import React, { useState } from 'react';

interface Contact {
  name?: string;
  email?: string;
  phone: string;
  company?: string;
  cnpj?: string;
  tags?: string[];
  notes?: string;
}

interface ContactFormProps {
  phoneNumber: string;
  onSubmit: (contact: Contact) => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ phoneNumber, onSubmit, onCancel }) => {
  const [contact, setContact] = useState<Contact>({
    name: '',
    email: '',
    phone: phoneNumber,
    company: '',
    cnpj: '',
    tags: ['prospectacao-whatsapp'],
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setContact(prev => ({
      ...prev,
      tags: [...new Set(['prospectacao-whatsapp', ...tags])]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(contact);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Informações do Contato</h3>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={contact.phone}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome do Contato
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={contact.name}
                onChange={handleChange}
                placeholder="Nome do contato"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={contact.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Empresa
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={contact.company}
                onChange={handleChange}
                placeholder="Nome da empresa"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
                CNPJ
              </label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={contact.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={contact.tags?.filter(t => t !== 'prospectacao-whatsapp').join(', ') || ''}
                onChange={handleTagsChange}
                placeholder="cliente-potencial, whatsapp, lead"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-gray-500 mt-1 block">A tag 'prospectacao-whatsapp' será adicionada automaticamente</span>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={contact.notes}
                onChange={handleChange}
                placeholder="Informações adicionais sobre o contato"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Enviar para RD Station
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
