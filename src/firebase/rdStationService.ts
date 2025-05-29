import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface RdStationConfig {
  apiToken: string;
  settings?: any;
}

export interface RdStationContactData {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  website?: string;
  jobTitle?: string;
  customFields?: any;
}

export const firebaseRdStationService = {
  // Salvar configuração
  saveConfig: async (userId: string, apiToken: string, settings?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      await setDoc(doc(db, 'rdStationConfigs', userId), {
        apiToken,
        settings: settings || {},
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao salvar configuração RD Station:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao salvar configuração'
      };
    }
  },
  
  // Obter configuração
  getConfig: async (userId: string): Promise<{ success: boolean; config?: RdStationConfig; error?: string }> => {
    try {
      const docRef = doc(db, 'rdStationConfigs', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          success: true,
          config: {
            apiToken: data.apiToken,
            settings: data.settings || {}
          }
        };
      } else {
        return {
          success: false,
          config: undefined
        };
      }
    } catch (error: any) {
      console.error('Erro ao obter configuração RD Station:', error);
      return {
        success: false,
        error: error.message || 'Erro ao obter configuração'
      };
    }
  },
  
  // Enviar contato para o RD Station
  sendContact: async (
    userId: string,
    data: RdStationContactData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Primeiro, obter o token da API
      const configResult = await firebaseRdStationService.getConfig(userId);
      
      if (!configResult.success || !configResult.config) {
        return {
          success: false,
          error: 'Configuração do RD Station não encontrada'
        };
      }
      
      const { apiToken } = configResult.config;
      
      // Em uma implementação real, aqui você faria uma chamada para a API do RD Station
      // Neste exemplo, apenas salvaremos o contato no Firestore para fins de demonstração
      
      await setDoc(doc(db, `rdStationContacts/${userId}/contacts`, Date.now().toString()), {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        companyName: data.companyName || '',
        website: data.website || '',
        jobTitle: data.jobTitle || '',
        customFields: data.customFields || {},
        sentAt: serverTimestamp(),
        status: 'sent' // Em um caso real, isto seria atualizado com base na resposta da API
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao enviar contato para RD Station:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar contato'
      };
    }
  }
};

export default firebaseRdStationService;
