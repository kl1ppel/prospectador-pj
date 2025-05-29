import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface MessageData {
  phoneNumber: string;
  message: string;
  type?: 'whatsapp' | 'rdstation';
  contactName?: string;
  contactEmail?: string;
  metadata?: any;
}

export interface MessageHistoryItem {
  id: string;
  phoneNumber: string;
  message: string;
  type: string;
  status: string;
  sentAt: Date | null;
  contactName?: string;
  contactEmail?: string;
  metadata?: any;
  userId: string;
}

export interface MessagesResponse {
  success: boolean;
  messages?: MessageHistoryItem[];
  count?: number;
  error?: string;
}

export const firebaseMessageService = {
  // Enviar mensagem
  sendMessage: async (data: MessageData, userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Adicionar mensagem ao Firestore
      await addDoc(collection(db, 'messages'), {
        phoneNumber: data.phoneNumber,
        message: data.message,
        type: data.type || 'whatsapp',
        status: 'sent',
        sentAt: serverTimestamp(),
        contactName: data.contactName || '',
        contactEmail: data.contactEmail || '',
        metadata: data.metadata || {},
        userId: userId,
        createdAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao enviar mensagem'
      };
    }
  },
  
  // Obter histórico de mensagens
  getMessages: async (
    userId: string, 
    params?: {
      page?: number;
      pageSize?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
      query?: string;
    }
  ): Promise<MessagesResponse> => {
    try {
      // Valores padrão
      const pageSize = params?.pageSize || 10;
      const page = params?.page || 1;
      
      // Construir a consulta
      let q = query(
        collection(db, 'messages'),
        where('userId', '==', userId),
        orderBy('sentAt', 'desc'),
        limit(pageSize)
      );
      
      // Adicionar filtros adicionais se fornecidos
      // Nota: Para implementar filtros de data e query, seria necessário
      // criar índices compostos no Firestore
      
      // Executar a consulta
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      
      // Transformar os documentos em objetos MessageHistoryItem
      const messages: MessageHistoryItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          phoneNumber: data.phoneNumber || '',
          message: data.message || '',
          type: data.type || 'whatsapp',
          status: data.status || 'sent',
          sentAt: data.sentAt ? (data.sentAt as Timestamp).toDate() : null,
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          metadata: data.metadata || {},
          userId: data.userId
        };
      });
      
      return {
        success: true,
        messages,
        count: messages.length
      };
    } catch (error: any) {
      console.error('Erro ao obter mensagens:', error);
      return {
        success: false,
        error: error.message || 'Erro ao obter mensagens'
      };
    }
  },
  
  // Limpar histórico de mensagens
  clearHistory: async (
    userId: string,
    params?: {
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Consultar as mensagens a serem excluídas
      let q = query(
        collection(db, 'messages'),
        where('userId', '==', userId)
      );
      
      // Adicionar filtro de tipo se fornecido
      if (params?.type) {
        q = query(q, where('type', '==', params.type));
      }
      
      // Obter os documentos
      const querySnapshot = await getDocs(q);
      
      // Excluir cada documento
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao limpar histórico:', error);
      return {
        success: false,
        error: error.message || 'Erro ao limpar histórico'
      };
    }
  }
};

export default firebaseMessageService;
