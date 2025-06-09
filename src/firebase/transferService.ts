import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, auth, storage } from './config';

export interface TransferItem {
  id: string;
  type: 'text' | 'file';
  content: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Timestamp | Date | string;
  userId: string;
  storagePath?: string;
}

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: Error;
  fileName?: string;
  storagePath?: string;
}

const TRANSFERS_COLLECTION = 'transfers';

export const firebaseTransferService = {
  addTransferItem: async (itemData: Omit<TransferItem, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    try {
      const docRef = await addDoc(collection(db, TRANSFERS_COLLECTION), {
        ...itemData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error adding transfer item:', error);
      return { success: false, error: error.message || 'Failed to add transfer item' };
    }
  },

  onItemsUpdate: (
    userId: string,
    callback: (items: TransferItem[]) => void,
    onError: (error: Error) => void
  ) => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      onError(new Error('User not authenticated or userId mismatch'));
      return () => {};
    }

    const q = query(
      collection(db, TRANSFERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: TransferItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          items.push({
            id: doc.id,
            type: data.type,
            content: data.content,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            createdAt: data.createdAt,
            userId: data.userId,
            storagePath: data.storagePath,
          } as TransferItem);
        }
      });
      callback(items);
    }, (error) => {
      console.error("Error listening to transfer items:", error);
      onError(error);
    });

    return unsubscribe;
  },

  deleteTransferItem: async (item: TransferItem): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser || auth.currentUser.uid !== item.userId) {
      return { success: false, error: 'Permission denied or user not authenticated' };
    }
    try {
      await deleteDoc(doc(db, TRANSFERS_COLLECTION, item.id));

      if (item.type === 'file' && item.storagePath) {
        const fileRef = ref(storage, item.storagePath);
        await deleteObject(fileRef);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting transfer item:', error);
      return { success: false, error: error.message || 'Failed to delete transfer item' };
    }
  },

  downloadFile: async (userId: string): Promise<{ blob: Blob; fileName: string }> => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('User not authenticated or userId mismatch');
    }

    try {
      const items = await new Promise<TransferItem[]>((resolve, reject) => {
        const unsubscribe = firebaseTransferService.onItemsUpdate(
          userId,
          (items: TransferItem[]) => {
            unsubscribe();
            resolve(items);
          },
          (error: Error) => {
            unsubscribe();
            reject(error);
          }
        );
      });


      if (items.length === 0) {
        throw new Error('No files available for download');
      }

      const latestFile = items.find(item => item.type === 'file');
      if (!latestFile) {
        throw new Error('No file items found');
      }

      const response = await fetch(latestFile.content);
      const blob = await response.blob();
      
      return {
        blob,
        fileName: latestFile.fileName || 'downloaded-file'
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  uploadFile: async (
    file: File,
    userId: string,
    onProgress: (snapshot: UploadProgress) => void
  ): Promise<() => void> => {

    try {
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error('User not authenticated or userId mismatch');
      }

      const token = await auth.currentUser.getIdToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      const storagePath = `transfers/${userId}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, storagePath);
      
      const uploadTask = uploadBytesResumable(fileRef, file, {
        customMetadata: {
          owner: userId,
          uploadedBy: auth.currentUser.uid,
          contentType: file.type
        }
      });

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({ progress: progress, fileName: file.name });
        },
        (error) => {
          console.error('Upload error:', error);
          onProgress({ progress: 0, error: error, fileName: file.name });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress({ 
              progress: 100, 
              downloadURL: downloadURL, 
              fileName: file.name, 
              storagePath: storagePath 
            });
          } catch (error: any) {
            console.error('Error getting download URL:', error);
            onProgress({ progress: 100, error: error, fileName: file.name });
          }
        }
      );

      return () => uploadTask.cancel();
    } catch (error) {
      console.error('Upload initialization error:', error);
      onProgress({ progress: 0, error: error as Error, fileName: file.name });
      return () => {};
    }
  }
};

export default firebaseTransferService;
