import { useState } from 'react';
import { useNotionAI } from '../hooks/useNotionAI';
import { LeadForm } from './LeadForm';
import { LeadsList } from './LeadsList';

export interface Lead {
  id: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  interestLevel: number;
  tags: string[];
  source: string;
  status: string;
  aiInsights: string;
  lastContact: Date;
}

export const NotionCRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { analyzeLead, syncWithNotion } = useNotionAI();

  const handleAddLead = async (newLead: Omit<Lead, 'id' | 'status' | 'lastContact' | 'aiInsights' | 'tags'>) => {
    const aiAnalysis = await analyzeLead(JSON.stringify(newLead));
    
    const lead: Lead = {
      ...newLead,
      id: crypto.randomUUID(),
      status: 'new',
      lastContact: new Date(),
      aiInsights: aiAnalysis,
      tags: [],
      interestLevel: 0
    };
    
    setLeads([...leads, lead]);
    await syncWithNotion(lead);
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, ...updates } : lead
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        CRM de Leads com Notion AI
      </h1>
      
      <LeadForm onSubmit={handleAddLead} />
      <LeadsList 
        leads={leads} 
        onUpdate={updateLead}
      />
    </div>
  );
};
