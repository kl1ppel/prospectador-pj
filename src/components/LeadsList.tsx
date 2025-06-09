import { Lead } from './NotionCRM';

interface Lead {
  id: string;
  company: string;
  interestLevel: number;
  tags: string[];
}

interface LeadsListProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

export const LeadsList = ({ leads, onEdit }: LeadsListProps) => {
  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum lead cadastrado ainda. Adicione seu primeiro lead acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">Meus Leads</h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {leads.map((lead) => (
          <div key={lead.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{lead.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{lead.email}</p>
                {lead.phone && <p className="text-gray-600 dark:text-gray-300">{lead.phone}</p>}
                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {lead.source}
                </span>
              </div>
              
              <span className="px-2 py-1 text-xs font-semibold rounded-full ">
                {lead.status === 'new' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                {lead.status === 'contacted' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                {lead.status === 'qualified' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}
                {lead.status === 'converted' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
              </span>
            </div>
            
            {lead.aiInsights && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Insights do Notion AI</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{lead.aiInsights}</p>
              </div>
            )}
            
            <div className="mt-4 flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Contatar
              </button>
              <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                Qualificar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
