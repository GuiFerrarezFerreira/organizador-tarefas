import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';

let app = null;
let auth = null;
let db = null;
let persistenceEnabled = false;

export const initializeFirebase = (config) => {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Habilitar persistência offline
    if (!persistenceEnabled) {
      enableIndexedDbPersistence(db)
        .then(() => {
          persistenceEnabled = true;
          console.log('✓ Persistência offline ativada');
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Persistência offline: múltiplas abas abertas');
          } else if (err.code === 'unimplemented') {
            console.warn('Persistência offline não suportada neste navegador');
          }
        });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    return { 
      success: false, 
      error: 'Falha ao conectar com Firebase. Verifique as configurações.' 
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro no login:', error);
    
    let errorMessage = 'Erro ao fazer login';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Usuário desabilitado';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuário não encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Senha incorreta';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Credenciais inválidas';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erro de conexão. Verifique sua internet';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const saveTasks = async (userId, tasks) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'tasks'), { 
      tasks,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar tarefas:', error);
    
    let errorMessage = 'Erro ao salvar tarefas';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível. Dados salvos localmente';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const saveJobs = async (userId, jobs) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'jobs'), { 
      jobs,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar trabalhos:', error);
    
    let errorMessage = 'Erro ao salvar trabalhos';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível. Dados salvos localmente';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loadTasks = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'tasks'));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data().tasks };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
    
    let errorMessage = 'Erro ao carregar tarefas';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para acessar dados';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loadJobs = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'jobs'));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data().jobs };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao carregar trabalhos:', error);
    
    let errorMessage = 'Erro ao carregar trabalhos';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para acessar dados';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const subscribeToTasks = (userId, callback, errorCallback) => {
  return onSnapshot(
    doc(db, 'users', userId, 'data', 'tasks'),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().tasks);
      }
    },
    (error) => {
      console.error('Erro na subscrição de tarefas:', error);
      if (errorCallback) {
        errorCallback('Erro ao sincronizar tarefas em tempo real');
      }
    }
  );
};

export const subscribeToJobs = (userId, callback, errorCallback) => {
  return onSnapshot(
    doc(db, 'users', userId, 'data', 'jobs'),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().jobs);
      }
    },
    (error) => {
      console.error('Erro na subscrição de trabalhos:', error);
      if (errorCallback) {
        errorCallback('Erro ao sincronizar trabalhos em tempo real');
      }
    }
  );
};

export const saveTags = async (userId, tags) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'tags'), { 
      tags,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar tags:', error);
    
    let errorMessage = 'Erro ao salvar tags';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível. Dados salvos localmente';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loadTags = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'tags'));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data().tags };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao carregar tags:', error);
    
    let errorMessage = 'Erro ao carregar tags';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para acessar dados';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const subscribeToTags = (userId, callback, errorCallback) => {
  return onSnapshot(
    doc(db, 'users', userId, 'data', 'tags'),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().tags);
      }
    },
    (error) => {
      console.error('Erro na subscrição de tags:', error);
      if (errorCallback) {
        errorCallback('Erro ao sincronizar tags em tempo real');
      }
    }
  );
};

export const saveTransactions = async (userId, transactions) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'transactions'), { 
      transactions,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar transações:', error);
    
    let errorMessage = 'Erro ao salvar transações';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível. Dados salvos localmente';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loadTransactions = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'transactions'));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data().transactions };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    
    let errorMessage = 'Erro ao carregar transações';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para acessar dados';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const subscribeToTransactions = (userId, callback, errorCallback) => {
  return onSnapshot(
    doc(db, 'users', userId, 'data', 'transactions'),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().transactions);
      }
    },
    (error) => {
      console.error('Erro na subscrição de transações:', error);
      if (errorCallback) {
        errorCallback('Erro ao sincronizar transações em tempo real');
      }
    }
  );
};

export const saveFinanceCategories = async (userId, categories) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'financeCategories'), { 
      categories,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar categorias financeiras:', error);
    
    let errorMessage = 'Erro ao salvar categorias';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível. Dados salvos localmente';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loadFinanceCategories = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'financeCategories'));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data().categories };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao carregar categorias financeiras:', error);
    
    let errorMessage = 'Erro ao carregar categorias';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para acessar dados';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Servidor indisponível';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const subscribeToFinanceCategories = (userId, callback, errorCallback) => {
  return onSnapshot(
    doc(db, 'users', userId, 'data', 'financeCategories'),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().categories);
      }
    },
    (error) => {
      console.error('Erro na subscrição de categorias financeiras:', error);
      if (errorCallback) {
        errorCallback('Erro ao sincronizar categorias em tempo real');
      }
    }
  );
};

export const getAuth2 = () => auth;
export const getDb = () => db;
