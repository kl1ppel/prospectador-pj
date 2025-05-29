import axios from 'axios';

interface Contact {
  name?: string;
  email?: string;
  phone: string;
  company?: string;
  cnpj?: string;
  tags?: string[];
  notes?: string;
}

interface RDStationConfig {
  apiToken: string;
  apiUrl: string;
}

// Configuração para a API do RD Station
const rdStationConfig: RDStationConfig = {
  apiToken: localStorage.getItem('rdStationToken') || '',
  apiUrl: 'https://api.rd.services'
};

// Função para atualizar o token quando ele mudar
export const updateRdStationToken = (token: string): void => {
  rdStationConfig.apiToken = token;
};

/**
 * Envia um contato para o RD Station CRM
 * @param contact Dados do contato a ser enviado
 * @returns Resposta da API
 */
export const sendContactToRDStation = async (contact: Contact): Promise<any> => {
  try {
    if (!rdStationConfig.apiToken) {
      throw new Error('Token da API do RD Station não configurado');
    }

    // Formatando os dados conforme esperado pela API do RD Station
    const payload = {
      event_type: 'CONVERSION',
      event: {
        conversion_identifier: 'prospectacao-whatsapp',
        name: contact.name || 'Prospect',
        email: contact.email || `${contact.phone.replace(/\D/g, '')}@lead.prospector.com.br`,
        cf_telefone: contact.phone,
        cf_empresa: contact.company || '',
        cf_cnpj: contact.cnpj || '',
        tags: contact.tags || ['prospectacao-whatsapp'],
        notes: contact.notes || 'Contato adicionado via Prospector App'
      }
    };

    const response = await axios.post(
      `${rdStationConfig.apiUrl}/platform/events`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rdStationConfig.apiToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar contato para RD Station:', error);
    throw error;
  }
};

/**
 * Verifica se o token da API está configurado e válido
 * @returns True se o token estiver configurado
 */
export const isRDStationConfigured = (): boolean => {
  return !!rdStationConfig.apiToken;
};

/**
 * Atualiza o status de um contato no RD Station
 * @param contactEmail Email do contato
 * @param status Novo status
 * @returns Resposta da API
 */
export const updateContactStatus = async (contactEmail: string, status: string): Promise<any> => {
  try {
    if (!rdStationConfig.apiToken) {
      throw new Error('Token da API do RD Station não configurado');
    }

    const payload = {
      funnel_stage: status
    };

    const response = await axios.patch(
      `${rdStationConfig.apiUrl}/platform/contacts/email:${contactEmail}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rdStationConfig.apiToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status do contato no RD Station:', error);
    throw error;
  }
};
