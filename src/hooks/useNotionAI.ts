import { useState } from 'react';
import { createNotionPage } from '../services/notionService';

export const useNotionAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeLead = async (leadData: string) => {
    setIsLoading(true);
    try {
      // Implementação real da análise com Notion AI
      return `Análise gerada: ${leadData.substring(0, 50)}...`;
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithNotion = async (lead: any) => {
    setIsLoading(true);
    try {
      await createNotionPage(lead);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeLead, syncWithNotion, isLoading };
};
