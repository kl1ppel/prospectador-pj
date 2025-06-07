import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

export interface TransferItem {
  id: string;
  type: 'text' | 'file';
  content: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
  userId: string;
}

export const firebaseFileTransferService = {
  addText: async (userId: string, text: string): Promise<{ success: boolean; item?: TransferItem; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'transferItems'), {
        type: 'text',
        content: text,
        createdAt: serverTimestamp(),
        userId
      });
      const item: TransferItem = {
        id: docRef.id,
        type: 'text',
        content: text,
        createdAt: new Date(),
        userId
      };
      return { success: true, item };
    } catch (error: any) {
      console.error('Erro ao adicionar texto:', error);
      return { success: false, error: error.message || 'Erro ao adicionar texto' };
    }
  },

  addFile: async (
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; item?: TransferItem; error?: string }> => {
    try {
      const storageRef = ref(storage, `transferItems/${userId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress && onProgress(progress);
          },
          (error) => {
            console.error('Erro no upload:', error);
            reject({ success: false, error: error.message || 'Erro no upload' });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const docRef = await addDoc(collection(db, 'transferItems'), {
                type: 'file',
                content: downloadURL,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                createdAt: serverTimestamp(),
                userId
              });
              const item: TransferItem = {
                id: docRef.id,
                type: 'file',
                content: downloadURL,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                createdAt: new Date(),
                userId
              };
              resolve({ success: true, item });
            } catch (err: any) {
              console.error('Erro ao salvar metadados:', err);
              reject({ success: false, error: err.message || 'Erro ao salvar metadados' });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Erro ao enviar arquivo:', error);
      return { success: false, error: error.message || 'Erro ao enviar arquivo' };
    }
  },

  getItems: async (userId: string): Promise<{ success: boolean; items?: TransferItem[]; error?: string }> => {
    try {
      const q = query(collection(db, 'transferItems'), where('userId', '==', userId), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const items: TransferItem[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.type,
          content: data.content,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          userId: data.userId
        } as TransferItem;
      });
      return { success: true, items };
    } catch (error: any) {
      console.error('Erro ao obter itens:', error);
      return { success: false, error: error.message || 'Erro ao obter itens' };
    }
  },

  deleteItem: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await deleteDoc(doc(db, 'transferItems', id));
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      return { success: false, error: error.message || 'Erro ao excluir item' };
    }
  }
};

export default firebaseFileTransferService;
