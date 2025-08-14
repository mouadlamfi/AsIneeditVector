import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

// Check if Firebase is properly initialized
const isFirebaseAvailable = auth && db && storage;

// Auth hooks
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseAvailable) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, 'users', result.user.uid), {
        displayName,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    logout,
  };
}

// Firestore hooks
export function useFirestore() {
  const createDesign = async (designData: any, userId: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const docRef = await addDoc(collection(db, 'designs'), {
        ...designData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateDesign = async (designId: string, updates: any) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      await updateDoc(doc(db, 'designs', designId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteDesign = async (designId: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      await deleteDoc(doc(db, 'designs', designId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getUserDesigns = async (userId: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const q = query(
        collection(db, 'designs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const designs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, designs };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const createProject = async (projectData: any, userId: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getUserProjects = async (userId: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, projects };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    createDesign,
    updateDesign,
    deleteDesign,
    getUserDesigns,
    createProject,
    getUserProjects,
  };
}

// Storage hooks
export function useStorage() {
  const uploadFile = async (file: File, path: string, metadata?: any) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL, ref: snapshot.ref };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteFile = async (path: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const listFiles = async (path: string) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      const urls = await Promise.all(
        result.items.map(itemRef => getDownloadURL(itemRef))
      );
      return { success: true, files: result.items, urls };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    uploadFile,
    deleteFile,
    listFiles,
  };
}