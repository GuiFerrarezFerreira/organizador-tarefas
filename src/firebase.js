import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

let app = null;
let auth = null;
let db = null;

export const initializeFirebase = (config) => {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    return false;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: error.message };
  }
};

export const saveTasks = async (userId, tasks) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'tasks'), { tasks });
    return true;
  } catch (error) {
    console.error('Erro ao salvar tarefas:', error);
    return false;
  }
};

export const saveJobs = async (userId, jobs) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'jobs'), { jobs });
    return true;
  } catch (error) {
    console.error('Erro ao salvar trabalhos:', error);
    return false;
  }
};

export const loadTasks = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'tasks'));
    if (docSnap.exists()) {
      return docSnap.data().tasks;
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
    return null;
  }
};

export const loadJobs = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'jobs'));
    if (docSnap.exists()) {
      return docSnap.data().jobs;
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar trabalhos:', error);
    return null;
  }
};

export const subscribeToTasks = (userId, callback) => {
  return onSnapshot(doc(db, 'users', userId, 'data', 'tasks'), (doc) => {
    if (doc.exists()) {
      callback(doc.data().tasks);
    }
  });
};

export const subscribeToJobs = (userId, callback) => {
  return onSnapshot(doc(db, 'users', userId, 'data', 'jobs'), (doc) => {
    if (doc.exists()) {
      callback(doc.data().jobs);
    }
  });
};

export const getAuth2 = () => auth;
export const getDb = () => db;
