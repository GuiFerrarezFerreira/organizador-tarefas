import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, Briefcase, Moon, Sun, Cloud, CloudOff, Wifi, WifiOff, AlertCircle, CheckCircle, Tag, Search, Filter, SlidersHorizontal, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { 
  loginUser, 
  saveTasks, 
  loadTasks, 
  subscribeToTasks,
  saveJobs, 
  loadJobs, 
  subscribeToJobs,
  saveTags, 
  loadTags, 
  subscribeToTags,
  saveTransactions, 
  loadTransactions, 
  subscribeToTransactions,
  saveFinanceCategories, 
  loadFinanceCategories, 
  subscribeToFinanceCategories,
  savePeople, 
  loadPeople, 
  subscribeToPeople,
  saveCreditCards, 
  loadCreditCards, 
  subscribeToCreditCards,
  getCurrentUser
} from './supabase';
import FinanceSummary from './components/FinanceSummary';
import FinanceList from './components/FinanceList';
import FinanceForm from './components/FinanceForm';
import FinanceByPerson from './components/FinanceByPerson';  
import FinanceByCard from './components/FinanceByCard';
import TaskEditModal from './components/TaskEditModal';
import TransactionEditModal from './components/TransactionEditModal';
import FinanceByCardDetailed from './components/FinanceByCardDetailed';
import FinanceByPersonDetailed from './components/FinanceByPersonDetailed';
import { Edit2 } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [viewMode, setViewMode] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddTask, setShowAddTask] = useState(false);
  const [showManageJobs, setShowManageJobs] = useState(false);
  const [showManageTags, setShowManageTags] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showManageFinanceCategories, setShowManageFinanceCategories] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showFinanceByPerson, setShowFinanceByPerson] = useState(false);
  const [showFinanceByCard, setShowFinanceByCard] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  const [selectedEditTags, setSelectedEditTags] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [showFinanceByCardDetailed, setShowFinanceByCardDetailed] = useState(false);
  const [showFinanceByPersonDetailed, setShowFinanceByPersonDetailed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    const saved = localStorage.getItem('firebaseConfig');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || '';
  });
  
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });
  
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };
  
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('jobs');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Trabalho Fixo 1', color: 'bg-blue-100 text-blue-700' },
      { id: 2, name: 'Trabalho Fixo 2', color: 'bg-green-100 text-green-700' },
      { id: 3, name: 'Freelancers', color: 'bg-purple-100 text-purple-700' }
    ];
  });

  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('tags');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Urgente', color: 'bg-red-100 text-red-700' },
      { id: 2, name: 'Importante', color: 'bg-orange-100 text-orange-700' },
      { id: 3, name: 'Reunião', color: 'bg-blue-100 text-blue-700' }
    ];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [financeCategories, setFinanceCategories] = useState(() => {
    const saved = localStorage.getItem('financeCategories');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Salário', type: 'receita', color: 'bg-green-100 text-green-700' },
      { id: 2, name: 'Freelance', type: 'receita', color: 'bg-blue-100 text-blue-700' },
      { id: 3, name: 'Investimentos', type: 'receita', color: 'bg-purple-100 text-purple-700' },
      { id: 4, name: 'Alimentação', type: 'despesa', color: 'bg-red-100 text-red-700' },
      { id: 5, name: 'Transporte', type: 'despesa', color: 'bg-orange-100 text-orange-700' },
      { id: 6, name: 'Moradia', type: 'despesa', color: 'bg-pink-100 text-pink-700' },
      { id: 7, name: 'Lazer', type: 'despesa', color: 'bg-yellow-100 text-yellow-700' },
      { id: 8, name: 'Outros', type: 'ambos', color: 'bg-gray-100 text-gray-700' }
    ];
  });

const [showConflictModal, setShowConflictModal] = useState(false);
const [conflictData, setConflictData] = useState(null);

  const [newJobName, setNewJobName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newFinanceCategoryName, setNewFinanceCategoryName] = useState('');
  const [newFinanceCategoryType, setNewFinanceCategoryType] = useState('despesa');
  const [showManagePeople, setShowManagePeople] = useState(false);
const [showManageCreditCards, setShowManageCreditCards] = useState(false);
const [newPersonName, setNewPersonName] = useState('');
const [newCardData, setNewCardData] = useState({ 
  name: '', 
  owner: 1, 
  closingDay: 1, 
  dueDay: 10 
});

const [people, setPeople] = useState(() => {
  const saved = localStorage.getItem('people');
  return saved ? JSON.parse(saved) : [
    { id: 1, name: 'Eu', color: 'bg-blue-100 text-blue-700' }
  ];
});

const [creditCards, setCreditCards] = useState(() => {
  const saved = localStorage.getItem('creditCards');
  return saved ? JSON.parse(saved) : [];
});
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterByTags, setFilterByTags] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'all',
    type: 'all',
    jobId: 'all',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: ''
  });
  
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-yellow-100 text-yellow-700',
    'bg-indigo-100 text-indigo-700',
    'bg-red-100 text-red-700',
    'bg-teal-100 text-teal-700'
  ];
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    jobId: jobs[0]?.id || 1,
    type: 'projeto',
    date: new Date().toISOString().split('T')[0],
    time: '',
    tags: []
  });

  const [newTransaction, setNewTransaction] = useState({
  type: 'receita',
  categoryId: financeCategories.find(c => c.type === 'receita')?.id || 1,
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  jobId: null,
  completed: true,
  paymentMethod: 'checking',
  creditCardId: null,
  ownerId: people[0]?.id || 1,
  isRecurring: false,
  recurringType: 'monthly', // monthly, weekly, yearly
  isInstallment: false,
  installmentCount: 1,
  currentInstallment: 1,
  parentTransactionId: null // Para vincular parcelas
  });

  const [configForm, setConfigForm] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    email: '',
    password: ''
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(true);
      addNotification('Conexão restaurada', 'success');
    };
    
    const handleOffline = () => {
      setNetworkStatus(false);
      addNotification('Sem conexão com a internet', 'warning');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (jobs.length > 0 && !jobs.find(j => j.id === newTask.jobId)) {
      setNewTask(prev => ({
        ...prev,
        jobId: jobs[0].id
      }));
    }
  }, [jobs, newTask.jobId]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('lastModified', new Date().toISOString());        
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
    localStorage.setItem('lastModified', new Date().toISOString());    
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
    localStorage.setItem('lastModified', new Date().toISOString());
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('lastModified', new Date().toISOString());
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financeCategories', JSON.stringify(financeCategories));
    localStorage.setItem('lastModified', new Date().toISOString());    
  }, [financeCategories]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('lastModified', new Date().toISOString());    
  }, [darkMode]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('lastModified', new Date().toISOString());      
    }
  }, [userEmail]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    localStorage.setItem('lastModified', new Date().toISOString());      
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people));
    localStorage.setItem('lastModified', new Date().toISOString());    
    }, [people]);

useEffect(() => {
  localStorage.setItem('creditCards', JSON.stringify(creditCards));
    localStorage.setItem('lastModified', new Date().toISOString());  
}, [creditCards]);
  useEffect(() => {
    if (firebaseConfig && userId) {
      initializeAndSync();
    }
  }, [firebaseConfig, userId]);

const initializeAndSync = async () => {
  setIsOnline(true);
  setIsLoaded(false);
  
  try {
    const tasksResult = await loadTasks();
    const jobsResult = await loadJobs();
    const tagsResult = await loadTags();
    const transactionsResult = await loadTransactions();
    const financeCategoriesResult = await loadFinanceCategories();
    const peopleResult = await loadPeople();
    const creditCardsResult = await loadCreditCards();
    
    // Carregar dados
    if (tasksResult.success && tasksResult.data) {
      setTasks(tasksResult.data);
    }
    if (jobsResult.success && jobsResult.data) {
      setJobs(jobsResult.data);
    }
    if (tagsResult.success && tagsResult.data) {
      setTags(tagsResult.data);
    }
    if (transactionsResult.success && transactionsResult.data) {
      setTransactions(transactionsResult.data);
    }
    if (financeCategoriesResult.success && financeCategoriesResult.data) {
      setFinanceCategories(financeCategoriesResult.data);
    }
    if (peopleResult.success && peopleResult.data) {
      setPeople(peopleResult.data);
    }
    if (creditCardsResult.success && creditCardsResult.data) {
      setCreditCards(creditCardsResult.data);
    }
    
    addNotification('Dados sincronizados com sucesso', 'success');
    setupRealtimeListeners();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    addNotification('Erro ao sincronizar', 'error');
  }
  
  setIsLoaded(true);
};

const loadCloudData = async (tasksResult, jobsResult, tagsResult, transactionsResult, 
                              financeCategoriesResult, peopleResult, creditCardsResult) => {
  if (tasksResult.success && tasksResult.data) {
    setTasks(tasksResult.data);
    localStorage.setItem('tasks', JSON.stringify(tasksResult.data));
  } else if (!tasksResult.success) {
    addNotification(tasksResult.error, 'warning');
  }
  
  if (jobsResult.success && jobsResult.data) {
    setJobs(jobsResult.data);
    localStorage.setItem('jobs', JSON.stringify(jobsResult.data));
  } else if (!jobsResult.success) {
    addNotification(jobsResult.error, 'warning');
  }

  if (tagsResult.success && tagsResult.data) {
    setTags(tagsResult.data);
    localStorage.setItem('tags', JSON.stringify(tagsResult.data));
  } else if (!tagsResult.success) {
    addNotification(tagsResult.error, 'warning');
  }

  if (transactionsResult.success && transactionsResult.data) {
    setTransactions(transactionsResult.data);
    localStorage.setItem('transactions', JSON.stringify(transactionsResult.data));
  } else if (!transactionsResult.success) {
    addNotification(transactionsResult.error, 'warning');
  }

  if (financeCategoriesResult.success && financeCategoriesResult.data) {
    setFinanceCategories(financeCategoriesResult.data);
    localStorage.setItem('financeCategories', JSON.stringify(financeCategoriesResult.data));
  } else if (!financeCategoriesResult.success) {
    addNotification(financeCategoriesResult.error, 'warning');
  }

  if (peopleResult.success && peopleResult.data) {
    setPeople(peopleResult.data);
    localStorage.setItem('people', JSON.stringify(peopleResult.data));
  } else if (!peopleResult.success) {
    addNotification(peopleResult.error, 'warning');
  }

  if (creditCardsResult.success && creditCardsResult.data) {
    setCreditCards(creditCardsResult.data);
    localStorage.setItem('creditCards', JSON.stringify(creditCardsResult.data));
  } else if (!creditCardsResult.success) {
    addNotification(creditCardsResult.error, 'warning');
  }
  
  // Atualizar timestamp
  localStorage.setItem('lastModified', new Date().toISOString());
};

const setupRealtimeListeners = () => {
  const unsubscribeTasks = subscribeToTasks((newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  });
  
  const unsubscribeJobs = subscribeToJobs((newJobs) => {
    setJobs(newJobs);
    localStorage.setItem('jobs', JSON.stringify(newJobs));
  });

  const unsubscribeTags = subscribeToTags((newTags) => {
    setTags(newTags);
    localStorage.setItem('tags', JSON.stringify(newTags));
  });

  const unsubscribeTransactions = subscribeToTransactions((newTransactions) => {
    setTransactions(newTransactions);
    localStorage.setItem('transactions', JSON.stringify(newTransactions));
  });

  const unsubscribeFinanceCategories = subscribeToFinanceCategories((newCategories) => {
    setFinanceCategories(newCategories);
    localStorage.setItem('financeCategories', JSON.stringify(newCategories));
  });

  const unsubscribePeople = subscribeToPeople((newPeople) => {
    setPeople(newPeople);
    localStorage.setItem('people', JSON.stringify(newPeople));
  });

  const unsubscribeCreditCards = subscribeToCreditCards((newCards) => {
    setCreditCards(newCards);
    localStorage.setItem('creditCards', JSON.stringify(newCards));
  });
  
  return () => {
    unsubscribeTasks();
    unsubscribeJobs();
    unsubscribeTags();
    unsubscribeTransactions();
    unsubscribeFinanceCategories();
    unsubscribePeople();
    unsubscribeCreditCards();
  };
};

const useCloudData = async () => {
  setShowConflictModal(false);
  
  if (!conflictData) return;
  
  // Usar dados da nuvem
  if (conflictData.cloud.tasks) {
    setTasks(conflictData.cloud.tasks);
    localStorage.setItem('tasks', JSON.stringify(conflictData.cloud.tasks));
  }
  if (conflictData.cloud.jobs) {
    setJobs(conflictData.cloud.jobs);
    localStorage.setItem('jobs', JSON.stringify(conflictData.cloud.jobs));
  }
  if (conflictData.cloud.tags) {
    setTags(conflictData.cloud.tags);
    localStorage.setItem('tags', JSON.stringify(conflictData.cloud.tags));
  }
  if (conflictData.cloud.transactions) {
    setTransactions(conflictData.cloud.transactions);
    localStorage.setItem('transactions', JSON.stringify(conflictData.cloud.transactions));
  }
  if (conflictData.cloud.financeCategories) {
    setFinanceCategories(conflictData.cloud.financeCategories);
    localStorage.setItem('financeCategories', JSON.stringify(conflictData.cloud.financeCategories));
  }
  if (conflictData.cloud.people) {
    setPeople(conflictData.cloud.people);
    localStorage.setItem('people', JSON.stringify(conflictData.cloud.people));
  }
  if (conflictData.cloud.creditCards) {
    setCreditCards(conflictData.cloud.creditCards);
    localStorage.setItem('creditCards', JSON.stringify(conflictData.cloud.creditCards));
  }
  
  localStorage.setItem('lastModified', new Date().toISOString());
  setupRealtimeListeners();
  addNotification('Dados da nuvem carregados', 'success');
};

const useLocalData = async () => {
  setShowConflictModal(false);
  
  if (!conflictData) return;
  
  // Manter dados locais e enviar para nuvem
  await saveTasks(userId, conflictData.local.tasks);
  await saveJobs(userId, conflictData.local.jobs);
  await saveTags(userId, conflictData.local.tags);
  await saveTransactions(userId, conflictData.local.transactions);
  await saveFinanceCategories(userId, conflictData.local.financeCategories);
  await savePeople(userId, conflictData.local.people);
  await saveCreditCards(userId, conflictData.local.creditCards);
  
  localStorage.setItem('lastModified', new Date().toISOString());
  setupRealtimeListeners();
  addNotification('Dados locais enviados para nuvem', 'success');
};


  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await saveJobs(userId, jobs);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [jobs, isOnline, userId, isLoaded, networkStatus]);

  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await saveTags(userId, tags);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [tags, isOnline, userId, isLoaded, networkStatus]);

  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await saveTransactions(userId, transactions);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [transactions, isOnline, userId, isLoaded, networkStatus]);

  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await saveFinanceCategories(userId, financeCategories);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [financeCategories, isOnline, userId, isLoaded, networkStatus]);

  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await savePeople(userId, people);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [people, isOnline, userId, isLoaded, networkStatus]);

  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await saveCreditCards(userId, creditCards);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [creditCards, isOnline, userId, isLoaded, networkStatus]);

const saveFirebaseConfig = async () => {
  setSyncError('');
  setIsSyncing(true);
  
  const result = await loginUser(configForm.email, configForm.password);
  
  if (result.success) {
    // Salva credenciais no localStorage
    localStorage.setItem('supabaseAuth', JSON.stringify({
      email: configForm.email,
      // Não salve a senha em produção!
    }));
    
    setUserEmail(configForm.email);
    setUserId(result.user.id);
    
    // Salvar dados locais no Supabase
    await saveTasks(tasks);
    await saveJobs(jobs);
    await saveTags(tags);
    await saveTransactions(transactions);
    await saveFinanceCategories(financeCategories);
    await savePeople(people);
    await saveCreditCards(creditCards);
    
    setIsOnline(true);
    setShowSetup(false);
    setSyncError('');
    addNotification('Conectado com sucesso!', 'success');
    
    // Configurar listeners
    setupRealtimeListeners();
  } else {
    setSyncError(result.error);
  }
  
  setIsSyncing(false);
};

  const disconnectFirebase = () => {
    localStorage.removeItem('firebaseConfig');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setFirebaseConfig(null);
    setUserEmail('');
    setUserId('');
    setIsOnline(false);
    addNotification('Desconectado da nuvem', 'info');
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const validJobId = jobs.find(j => j.id === newTask.jobId) ? newTask.jobId : jobs[0]?.id;
      
      setTasks([...tasks, { 
        id: Date.now(), 
        ...newTask,
        jobId: validJobId,
        completed: false 
      }]);
      setNewTask({
        title: '',
        description: '',
        jobId: jobs[0]?.id || 1,
        type: 'projeto',
        date: new Date().toISOString().split('T')[0],
        time: '',
        tags: []
      });
      setShowAddTask(false);
      setSelectedTags([]);
      addNotification('Tarefa adicionada', 'success');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    addNotification('Tarefa removida', 'info');
  };
// Funções para edição de tarefas
const startEditTask = (task) => {
  setEditingTask(task);
  setEditedTask({ ...task });
  setSelectedEditTags(task.tags || []);
};

const toggleEditTag = (tagId) => {
  if (selectedEditTags.includes(tagId)) {
    setSelectedEditTags(selectedEditTags.filter(id => id !== tagId));
  } else {
    setSelectedEditTags([...selectedEditTags, tagId]);
  }
};

const saveTaskEdit = () => {
  if (editedTask && editedTask.title.trim()) {
    setTasks(tasks.map(task => 
      task.id === editedTask.id 
        ? { ...editedTask, tags: selectedEditTags }
        : task
    ));
    setEditingTask(null);
    setEditedTask(null);
    setSelectedEditTags([]);
    addNotification('Tarefa atualizada', 'success');
  }
};

const cancelTaskEdit = () => {
  setEditingTask(null);
  setEditedTask(null);
  setSelectedEditTags([]);
};

// Funções para edição de transações
const startEditTransaction = (transaction) => {
  setEditingTransaction(transaction);
  setEditedTransaction({ ...transaction });
};

const saveTransactionEdit = () => {
  if (editedTransaction && editedTransaction.amount > 0) {
    setTransactions(transactions.map(t => 
      t.id === editedTransaction.id ? editedTransaction : t
    ));
    setEditingTransaction(null);
    setEditedTransaction(null);
    addNotification('Transação atualizada', 'success');
  }
};

const cancelTransactionEdit = () => {
  setEditingTransaction(null);
  setEditedTransaction(null);
};

  const addJob = () => {
    if (newJobName.trim()) {
      const newJob = {
        id: Date.now(),
        name: newJobName,
        color: colors[jobs.length % colors.length]
      };
      setJobs([...jobs, newJob]);
      setNewJobName('');
      addNotification('Trabalho adicionado', 'success');
    }
  };

  const deleteJob = (jobId) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter(job => job.id !== jobId));
      setTasks(tasks.filter(task => task.jobId !== jobId));
      if (activeTab === jobId.toString()) {
        setActiveTab('daily');
      }
      addNotification('Trabalho removido', 'info');
    }
  };

  const addTag = () => {
    if (newTagName.trim()) {
      const newTag = {
        id: Date.now(),
        name: newTagName,
        color: colors[tags.length % colors.length]
      };
      setTags([...tags, newTag]);
      setNewTagName('');
      addNotification('Tag adicionada', 'success');
    }
  };

  const deleteTag = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
    setTasks(tasks.map(task => ({
      ...task,
      tags: task.tags?.filter(id => id !== tagId) || []
    })));
    setFilterByTags(filterByTags.filter(id => id !== tagId));
    addNotification('Tag removida', 'info');
  };

  const toggleTagInTask = (tagId) => {
    const currentTags = selectedTags;
    if (currentTags.includes(tagId)) {
      setSelectedTags(currentTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...currentTags, tagId]);
    }
  };

  const toggleFilterTag = (tagId) => {
    if (filterByTags.includes(tagId)) {
      setFilterByTags(filterByTags.filter(id => id !== tagId));
    } else {
      setFilterByTags([...filterByTags, tagId]);
    }
  };

  useEffect(() => {
    setNewTask(prev => ({ ...prev, tags: selectedTags }));
  }, [selectedTags]);

const addTransaction = () => {
  if (newTransaction.amount > 0) {
    const baseTransaction = { 
      id: Date.now(), 
      ...newTransaction
    };

    let transactionsToAdd = [];

    // Se for parcelado, criar múltiplas transações
    if (newTransaction.isInstallment && newTransaction.installmentCount > 1) {
      const parentId = baseTransaction.id;
      
      for (let i = 0; i < newTransaction.installmentCount; i++) {
        const installmentDate = new Date(newTransaction.date);
        installmentDate.setMonth(installmentDate.getMonth() + i);
        
        transactionsToAdd.push({
          ...baseTransaction,
          id: parentId + i,
          parentTransactionId: parentId,
          currentInstallment: i + 1,
          date: installmentDate.toISOString().split('T')[0],
          description: `${newTransaction.description} (${i + 1}/${newTransaction.installmentCount})`,
          completed: i === 0 ? newTransaction.completed : false
        });
      }
      
      addNotification(`${newTransaction.installmentCount} parcelas criadas`, 'success');
    } 
    // Se for recorrente, apenas marcar (será criada automaticamente)
    else if (newTransaction.isRecurring) {
      transactionsToAdd.push({
        ...baseTransaction,
        description: `🔄 ${newTransaction.description}`
      });
      addNotification('Despesa recorrente criada', 'success');
    }
    // Transação única normal
    else {
      transactionsToAdd.push(baseTransaction);
      addNotification('Transação adicionada', 'success');
    }

    setTransactions([...transactions, ...transactionsToAdd]);
    
    setNewTransaction({
      type: 'receita',
      categoryId: financeCategories.find(c => c.type === 'receita')?.id || 1,
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      jobId: null,
      completed: true,
      paymentMethod: 'checking',
      creditCardId: null,
      ownerId: people[0]?.id || 1,
      isRecurring: false,
      recurringType: 'monthly',
      isInstallment: false,
      installmentCount: 1,
      currentInstallment: 1,
      parentTransactionId: null
    });
    setShowAddTransaction(false);
  }
};

  const toggleTransaction = (id) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    addNotification('Transação removida', 'info');
  };

  const addFinanceCategory = () => {
    if (newFinanceCategoryName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newFinanceCategoryName,
        type: newFinanceCategoryType,
        color: colors[financeCategories.length % colors.length]
      };
      setFinanceCategories([...financeCategories, newCategory]);
      setNewFinanceCategoryName('');
      addNotification('Categoria adicionada', 'success');
    }
  };

  const deleteFinanceCategory = (categoryId) => {
    setFinanceCategories(financeCategories.filter(c => c.id !== categoryId));
    setTransactions(transactions.filter(t => t.categoryId !== categoryId));
    addNotification('Categoria removida', 'info');
  };

  const getJobColor = (jobId) => {
    return jobs.find(j => j.id === jobId)?.color || 'bg-gray-100 text-gray-700';
  };

  const getJobName = (jobId) => {
    return jobs.find(j => j.id === jobId)?.name || '';
  };

  const getTagColor = (tagId) => {
    return tags.find(t => t.id === tagId)?.color || 'bg-gray-100 text-gray-700';
  };

  const getTagName = (tagId) => {
    return tags.find(t => t.id === tagId)?.name || '';
  };

  const getCategoryColor = (categoryId) => {
    return financeCategories.find(c => c.id === categoryId)?.color || 'bg-gray-100 text-gray-700';
  };

  const getCategoryName = (categoryId) => {
    return financeCategories.find(c => c.id === categoryId)?.name || '';
  };


const addPerson = () => {
  if (newPersonName.trim()) {
    const newPerson = {
      id: Date.now(),
      name: newPersonName,
      color: colors[people.length % colors.length]
    };
    setPeople([...people, newPerson]);
    setNewPersonName('');
    addNotification('Pessoa adicionada', 'success');
  }
};

const deletePerson = (personId) => {
  if (people.length > 1) {
    setPeople(people.filter(p => p.id !== personId));
    setTransactions(transactions.map(t => 
      t.ownerId === personId ? { ...t, ownerId: people[0].id } : t
    ));
    addNotification('Pessoa removida', 'info');
  }
};

const addCreditCard = () => {
  if (newCardData.name.trim()) {
    const newCard = {
      id: Date.now(),
      ...newCardData,
      color: colors[creditCards.length % colors.length]
    };
    setCreditCards([...creditCards, newCard]);
    setNewCardData({ name: '', owner: people[0]?.id || 1, closingDay: 1, dueDay: 10 });
    addNotification('Cartão adicionado', 'success');
  }
};

const deleteCreditCard = (cardId) => {
  setCreditCards(creditCards.filter(c => c.id !== cardId));
  setTransactions(transactions.filter(t => t.creditCardId !== cardId));
  addNotification('Cartão removido', 'info');
};

const getPersonName = (personId) => {
  return people.find(p => p.id === personId)?.name || '';
};

const getPersonColor = (personId) => {
  return people.find(p => p.id === personId)?.color || 'bg-gray-100 text-gray-700';
};

const getCreditCardName = (cardId) => {
  return creditCards.find(c => c.id === cardId)?.name || '';
};

  const filterTasks = () => {
    let filtered = [];
    
    if (activeTab === 'daily' || activeTab === 'weekly') {
      const today = new Date().toISOString().split('T')[0];
      if (viewMode === 'daily') {
        filtered = tasks.filter(task => task.date === today);
      } else if (viewMode === 'weekly') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= new Date() && taskDate <= weekFromNow;
        });
      } else if (viewMode === 'monthly') {
        filtered = tasks.filter(task => task.date.startsWith(selectedMonth));
      }
    } else {
      const jobId = parseInt(activeTab);
      const today = new Date().toISOString().split('T')[0];
      
      let filteredByJob = tasks.filter(task => task.jobId === jobId);
      
      if (viewMode === 'daily') {
        filtered = filteredByJob.filter(task => task.date === today);
      } else if (viewMode === 'weekly') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = filteredByJob.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= new Date() && taskDate <= weekFromNow;
        });
      } else if (viewMode === 'monthly') {
        filtered = filteredByJob.filter(task => task.date.startsWith(selectedMonth));
      } else {
        filtered = filteredByJob;
      }
    }
    
    if (filterByTags.length > 0) {
      filtered = filtered.filter(task => {
        const taskTags = task.tags || [];
        return filterByTags.some(tagId => taskTags.includes(tagId));
      });
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        getJobName(task.jobId).toLowerCase().includes(query) ||
        task.type.toLowerCase().includes(query) ||
        (task.tags || []).some(tagId => 
          getTagName(tagId).toLowerCase().includes(query)
        )
      );
    }
    
    if (advancedFilters.status !== 'all') {
      filtered = filtered.filter(task => {
        if (advancedFilters.status === 'completed') return task.completed;
        if (advancedFilters.status === 'pending') return !task.completed;
        return true;
      });
    }
    
    if (advancedFilters.type !== 'all') {
      filtered = filtered.filter(task => task.type === advancedFilters.type);
    }
    
    if (advancedFilters.jobId !== 'all') {
      filtered = filtered.filter(task => task.jobId === parseInt(advancedFilters.jobId));
    }
    
    if (advancedFilters.dateRange === 'custom' && advancedFilters.customStartDate && advancedFilters.customEndDate) {
      filtered = filtered.filter(task => {
        return task.date >= advancedFilters.customStartDate && task.date <= advancedFilters.customEndDate;
      });
    }
    
    return filtered;
  };

  const filterTransactions = () => {
    let filtered = transactions;
    
    if (viewMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date === today);
    } else if (viewMode === 'weekly') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= new Date() && tDate <= weekFromNow;
      });
    } else if (viewMode === 'monthly') {
      filtered = filtered.filter(t => t.date.startsWith(selectedMonth));
    }
    
    return filtered;
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterByTags([]);
    setAdvancedFilters({
      status: 'all',
      type: 'all',
      jobId: 'all',
      dateRange: 'all',
      customStartDate: '',
      customEndDate: ''
    });
    addNotification('Filtros limpos', 'info');
  };

  const hasActiveFilters = () => {
    return searchQuery.trim() !== '' ||
           filterByTags.length > 0 ||
           advancedFilters.status !== 'all' ||
           advancedFilters.type !== 'all' ||
           advancedFilters.jobId !== 'all' ||
           advancedFilters.dateRange === 'custom';
  };

  const filteredTasks = filterTasks();
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const sortedTransactions = [...filterTransactions()].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder="Buscar tarefas..."]')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowAdvancedFilters(!showAdvancedFilters);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (activeTab === 'finance') {
          setShowAddTransaction(true);
        } else {
          setShowAddTask(true);
        }
      }
      if (e.key === 'Escape') {
        setShowAddTask(false);
        setShowAddTransaction(false);
        setShowManageJobs(false);
        setShowManageTags(false);
        setShowManageFinanceCategories(false);
        setShowAdvancedFilters(false);
        setShowSetup(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAdvancedFilters, activeTab]);

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sistema de Notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
              notif.type === 'success' 
                ? 'bg-green-500 text-white' 
                : notif.type === 'error' 
                ? 'bg-red-500 text-white'
                : notif.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {notif.type === 'success' && <CheckCircle size={18} />}
            {notif.type === 'error' && <AlertCircle size={18} />}
            {notif.type === 'warning' && <AlertCircle size={18} />}
            <span className="text-sm font-medium">{notif.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-light mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Minhas Tarefas</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Organização simples e clara</p>
            </div>
            <div className="flex gap-2">
              <div
                className={`p-2 rounded-lg ${
                  networkStatus
                    ? darkMode ? 'bg-gray-800 text-green-400' : 'bg-green-50 text-green-600'
                    : darkMode ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-600'
                }`}
                title={networkStatus ? 'Conectado à internet' : 'Sem conexão'}
              >
                {networkStatus ? <Wifi size={20} /> : <WifiOff size={20} />}
              </div>
              
              <button
                onClick={() => setShowSetup(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isOnline
                    ? darkMode 
                      ? 'bg-green-900 text-green-400 hover:bg-green-800' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={isOnline ? 'Conectado à nuvem' : 'Configurar sincronização'}
              >
                {isOnline ? <Cloud size={20} /> : <CloudOff size={20} />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setShowManageJobs(true)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Gerenciar Trabalhos
              </button>
              <button
                onClick={() => setShowManageTags(true)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Tag size={16} className="inline mr-1" />
                Tags
              </button>
<button
  onClick={() => setShowManagePeople(true)}
  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
    darkMode 
      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
  }`}
>
  Pessoas
</button>
<button
  onClick={() => setShowManageCreditCards(true)}
  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
    darkMode 
      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
  }`}
>
  Cartões
</button>              
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`flex border-b overflow-x-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${
                activeTab === 'daily' 
                  ? `border-b-2 border-blue-500 font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}` 
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              Visão Geral
            </button>
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setActiveTab(job.id.toString())}
                className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${
                  activeTab === job.id.toString()
                    ? `border-b-2 border-blue-500 font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                    : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                }`}
              >
                {job.name}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-6 py-4 text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'finance'
                  ? `border-b-2 border-blue-500 font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              <DollarSign size={16} />
              Finanças
            </button>
          </div>
        </div>


{activeTab === 'finance' && (
  <div>
    {/* Botões de controle */}
    <div className="mb-6 space-y-3">
      {/* Botões de visualização e período */}
      <div className="flex items-center justify-between flex-wrap gap-3">
<div className="flex gap-2 flex-wrap">
  <button
    onClick={() => {
      setShowFinanceByPerson(false);
      setShowFinanceByPersonDetailed(false);
      setShowFinanceByCard(!showFinanceByCard);
      setShowFinanceByCardDetailed(false);
    }}
    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
      showFinanceByCard
        ? 'bg-indigo-500 text-white'
        : darkMode 
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
    }`}
  >
    💳 Resumo por Cartão
  </button>

  <button
    onClick={() => {
      setShowFinanceByPerson(false);
      setShowFinanceByPersonDetailed(false);
      setShowFinanceByCard(false);
      setShowFinanceByCardDetailed(!showFinanceByCardDetailed);
    }}
    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
      showFinanceByCardDetailed
        ? 'bg-indigo-500 text-white'
        : darkMode 
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
    }`}
  >
    📋 Lista por Cartão
  </button>

  <button
    onClick={() => {
      setShowFinanceByCard(false);
      setShowFinanceByCardDetailed(false);
      setShowFinanceByPersonDetailed(false);
      setShowFinanceByPerson(!showFinanceByPerson);
    }}
    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
      showFinanceByPerson
        ? 'bg-purple-500 text-white'
        : darkMode 
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
    }`}
  >
    👥 Resumo por Pessoa
  </button>

  <button
    onClick={() => {
      setShowFinanceByCard(false);
      setShowFinanceByCardDetailed(false);
      setShowFinanceByPerson(false);
      setShowFinanceByPersonDetailed(!showFinanceByPersonDetailed);
    }}
    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
      showFinanceByPersonDetailed
        ? 'bg-purple-500 text-white'
        : darkMode 
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
    }`}
  >
    📋 Lista por Pessoa
  </button>

  <button
    onClick={() => setShowManageFinanceCategories(true)}
    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
      darkMode 
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
    }`}
  >
    Gerenciar Categorias
  </button>
</div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setViewMode('daily')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            viewMode === 'daily'
              ? 'bg-blue-500 text-white'
              : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'}`
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            viewMode === 'weekly'
              ? 'bg-blue-500 text-white'
              : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'}`
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            viewMode === 'monthly'
              ? 'bg-blue-500 text-white'
              : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'}`
          }`}
        >
          Este Mês
        </button>
        {viewMode === 'monthly' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
        )}
      </div>
    </div>

    {/* Renderização condicional */}
{showFinanceByCardDetailed ? (
  <FinanceByCardDetailed
    transactions={sortedTransactions}
    creditCards={creditCards}
    people={people}
    getCategoryName={getCategoryName}
    getCategoryColor={getCategoryColor}
    darkMode={darkMode}
  />
) : showFinanceByPersonDetailed ? (
  <FinanceByPersonDetailed
    transactions={sortedTransactions}
    people={people}
    getCategoryName={getCategoryName}
    getCategoryColor={getCategoryColor}
    getJobName={getJobName}
    getCreditCardName={getCreditCardName}
    darkMode={darkMode}
  />
) : showFinanceByCard ? (
  <FinanceByCard
    transactions={sortedTransactions}
    creditCards={creditCards}
    people={people}
    darkMode={darkMode}
  />
) : showFinanceByPerson ? (
  <FinanceByPerson
    transactions={sortedTransactions}
    people={people}
    darkMode={darkMode}
  />
) : (
      // Visualização normal (lista)
      <>
        <FinanceSummary transactions={sortedTransactions} darkMode={darkMode} />

        <FinanceList
          transactions={sortedTransactions}
          onToggle={toggleTransaction}
          onDelete={deleteTransaction}
          onEdit={startEditTransaction}
          getCategoryColor={getCategoryColor}
          getCategoryName={getCategoryName}
          getJobName={getJobName}
          getPersonName={getPersonName}
          getCreditCardName={getCreditCardName}
          darkMode={darkMode}
        />

        {!showAddTransaction ? (
          <button
            onClick={() => setShowAddTransaction(true)}
            className={`mt-6 w-full border-2 border-dashed rounded-lg p-4 transition-colors flex items-center justify-center gap-2 ${
              darkMode 
                ? 'border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-400 bg-gray-800' 
                : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 bg-white'
            }`}
          >
            <Plus size={20} />
            <span>Adicionar transação</span>
          </button>
        ) : (
          <FinanceForm
            newTransaction={newTransaction}
            setNewTransaction={setNewTransaction}
            categories={financeCategories}
            jobs={jobs}
            people={people}
            creditCards={creditCards}
            onSubmit={addTransaction}
            onCancel={() => setShowAddTransaction(false)}
            darkMode={darkMode}
          />
        )}
      </>
    )}
  </div>
)}

        {activeTab !== 'finance' && (
          <div>
            {(activeTab === 'daily' || parseInt(activeTab)) && (
              <div className="mb-6 space-y-3">
                <div className="flex gap-2">
                  <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}>
                    <Search size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    <input
                      type="text"
                      placeholder="Buscar tarefas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`flex-1 bg-transparent border-none outline-none text-sm ${
                        darkMode ? 'text-gray-200 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      showAdvancedFilters || hasActiveFilters()
                        ? 'bg-blue-500 text-white'
                        : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <SlidersHorizontal size={16} />
                    Filtros
                  </button>
                </div>

                {showAdvancedFilters && (
                  <div className={`p-4 rounded-lg space-y-3 ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                    <div className={`grid ${activeTab === 'daily' ? 'grid-cols-2' : 'grid-cols-2'} gap-3`}>
                      <div>
                        <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                        <select
                          value={advancedFilters.status}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-200' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="all">Todas</option>
                          <option value="pending">Pendentes</option>
                          <option value="completed">Concluídas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo</label>
                        <select
                          value={advancedFilters.type}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, type: e.target.value})}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-200' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="all">Todos</option>
                          <option value="projeto">Projeto</option>
                          <option value="atendimento">Atendimento</option>
                          <option value="freelance">Freelance</option>
                        </select>
                      </div>
                      
                      {activeTab === 'daily' && (
                        <div>
                          <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trabalho</label>
                          <select
                            value={advancedFilters.jobId}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, jobId: e.target.value})}
                            className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <option value="all">Todos</option>
                            {jobs.map(job => (
                              <option key={job.id} value={job.id}>{job.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className={activeTab === 'daily' ? '' : 'col-span-2'}>
                        <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Período</label>
                        <select
                          value={advancedFilters.dateRange}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, dateRange: e.target.value})}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-200' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="all">Todos</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                    </div>
                    
                    {advancedFilters.dateRange === 'custom' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data início</label>
                          <input
                            type="date"
                            value={advancedFilters.customStartDate}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, customStartDate: e.target.value})}
                            className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data fim</label>
                          <input
                            type="date"
                            value={advancedFilters.customEndDate}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, customEndDate: e.target.value})}
                            className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('daily')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewMode === 'daily'
                        ? 'bg-blue-500 text-white'
                        : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewMode === 'weekly'
                        ? 'bg-blue-500 text-white'
                        : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    Esta Semana
                  </button>
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewMode === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    Este Mês
                  </button>
                  {viewMode === 'monthly' && (
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`px-4 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  )}
                </div>
                
                {tags.length > 0 && (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filtrar por tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => toggleFilterTag(tag.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            filterByTags.includes(tag.id)
                              ? tag.color + ' ring-2 ring-blue-500'
                              : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                      {filterByTags.length > 0 && (
                        <button
                          onClick={() => setFilterByTags([])}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Limpar tags
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
                  >
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {hasActiveFilters() && (
                <div className={`px-4 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {sortedTasks.length} {sortedTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
                </div>
              )}
              
{sortedTasks.map(task => (
  <div
    key={task.id}
    className={`rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}
  >
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getJobColor(task.jobId)}`}>
            {getJobName(task.jobId)}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {task.type}
          </span>
          {task.tags && task.tags.length > 0 && (
            <>
              {task.tags.map(tagId => (
                <span key={tagId} className={`px-2 py-1 rounded text-xs font-medium ${getTagColor(tagId)}`}>
                  <Tag size={10} className="inline mr-1" />
                  {getTagName(tagId)}
                </span>
              ))}
            </>
          )}
        </div>
        <p className={`mb-2 ${task.completed 
          ? `line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}` 
          : `${darkMode ? 'text-gray-200' : 'text-gray-800'}`
        }`}>
          {task.title}
        </p>
        <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(task.date + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
          {task.time && <span>{task.time}</span>}
        </div>
      </div>
      
      {/* SUBSTITUIR O BOTÃO ÚNICO POR ESTA DIV COM 2 BOTÕES */}
      <div className="flex gap-2">
        <button
          onClick={() => startEditTask(task)}
          className={`transition-colors ${
            darkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'
          }`}
          title="Editar tarefa"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className={`transition-colors ${
            darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
          }`}
          title="Excluir tarefa"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  </div>
))}

              {sortedTasks.length === 0 && (
                <div className={`rounded-lg p-12 text-center ${
                  darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'
                }`}>
                  <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa para mostrar</p>
                </div>
              )}
            </div>

            {!showAddTask ? (
              <button
                onClick={() => setShowAddTask(true)}
                className={`mt-6 w-full border-2 border-dashed rounded-lg p-4 transition-colors flex items-center justify-center gap-2 ${
                  darkMode 
                    ? 'border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-400 bg-gray-800' 
                    : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 bg-white'
                }`}
              >
                <Plus size={20} />
                <span>Adicionar tarefa</span>
              </button>
            ) : (
              <div className={`mt-6 rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Nova Tarefa</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome da tarefa"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newTask.jobId}
                      onChange={(e) => setNewTask({ ...newTask, jobId: parseInt(e.target.value) })}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.name}</option>
                      ))}
                    </select>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      <option value="projeto">Projeto</option>
                      <option value="atendimento">Atendimento</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                    <input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      placeholder="Horário (opcional)"
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  
                  {tags.length > 0 && (
                    <div>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags (opcional):</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTagInTask(tag.id)}
                            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                              selectedTags.includes(tag.id)
                                ? tag.color + ' ring-2 ring-blue-500'
                                : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Tag size={12} className="inline mr-1" />
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={addTask}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => setShowAddTask(false)}
                      className={`px-6 py-3 rounded-lg transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modais */}
      {showManageJobs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Gerenciar Trabalhos</h3>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {jobs.map(job => (
                <div key={job.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${job.color}`}>
                    {job.name}
                  </span>
                  {jobs.length > 1 && (
                    <button
                      onClick={() => deleteJob(job.id)}
                      className={`transition-colors ${
                        darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do novo trabalho"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addJob()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <div className="flex gap-3">
                <button
                  onClick={addJob}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Adicionar Trabalho
                </button>
                <button
                  onClick={() => {
                    setShowManageJobs(false);
                    setNewJobName('');
                  }}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManageTags && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Gerenciar Tags</h3>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {tags.map(tag => (
                <div key={tag.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${tag.color}`}>
                    <Tag size={14} className="inline mr-1" />
                    {tag.name}
                  </span>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className={`transition-colors ${
                      darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome da nova tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <div className="flex gap-3">
                <button
                  onClick={addTag}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Adicionar Tag
                </button>
                <button
                  onClick={() => {
                    setShowManageTags(false);
                    setNewTagName('');
                  }}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManageFinanceCategories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Gerenciar Categorias</h3>
            
            <div className="space-y-3 mb-6">
              {financeCategories.map(cat => (
                <div key={cat.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${cat.color}`}>
                      {cat.name}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cat.type === 'receita' ? '💚' : cat.type === 'despesa' ? '❤️' : '💙'}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteFinanceCategory(cat.id)}
                    className={`transition-colors ${
                      darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome da nova categoria"
                value={newFinanceCategoryName}
                onChange={(e) => setNewFinanceCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFinanceCategory()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <select
                value={newFinanceCategoryType}
                onChange={(e) => setNewFinanceCategoryType(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
                <option value="ambos">Ambos</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={addFinanceCategory}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Adicionar Categoria
                </button>
                <button
                  onClick={() => {
                    setShowManageFinanceCategories(false);
                    setNewFinanceCategoryName('');
                  }}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-lg p-6 max-w-2xl w-full my-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Configurar Sincronização na Nuvem
            </h3>
            
            {firebaseConfig ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'}`}>
                  <p className="font-medium mb-1">✓ Conectado à nuvem</p>
                  <p className="text-sm opacity-80">Email: {userEmail}</p>
                  <p className="text-sm opacity-80">Projeto: {firebaseConfig.projectId}</p>
                </div>
                
                <button
                  onClick={disconnectFirebase}
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Desconectar
                </button>
                
                <button
                  onClick={() => setShowSetup(false)}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg text-sm ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
                  <p className="font-medium mb-2">📝 Como configurar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Acesse <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.firebase.google.com</a></li>
                    <li>No Firebase Console, vá em "Configurações do projeto" → "Geral"</li>
                    <li>Role até "Seus aplicativos" e clique no ícone Web</li>
                    <li>Copie as configurações e cole abaixo</li>
                    <li>Em "Authentication", ative "Email/Password"</li>
                    <li>Em "Firestore Database", crie um banco de dados</li>
                    <li>Em "Authentication" → "Users", adicione um usuário</li>
                  </ol>
                </div>

                {syncError && (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'}`}>
                    <p className="text-sm">{syncError}</p>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="API Key"
                  value={configForm.apiKey}
                  onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
                
                <input
                  type="text"
                  placeholder="Auth Domain (ex: meu-app.firebaseapp.com)"
                  value={configForm.authDomain}
                  onChange={(e) => setConfigForm({...configForm, authDomain: e.target.value})}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
                
                <input
                  type="text"
                  placeholder="Project ID"
                  value={configForm.projectId}
                  onChange={(e) => setConfigForm({...configForm, projectId: e.target.value})}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
                
                <input
                  type="text"
                  placeholder="Storage Bucket"
                  value={configForm.storageBucket}
                  onChange={(e) => setConfigForm({...configForm, storageBucket: e.target.value})}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
                
                <input
                  type="text"
                  placeholder="Messaging Sender ID"
                  value={configForm.messagingSenderId}
                  onChange={(e) => setConfigForm({...configForm, messagingSenderId: e.target.value})}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
                
                <input
                  type="text"
                  placeholder="App ID"
                  value={configForm.appId}
                  onChange={(e) => setConfigForm({...configForm, appId: e.target.value})}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                  }`}
                />

                <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Credenciais de acesso (usuário do Firebase):</p>
                  <input
                    type="email"
                    placeholder="Email"
                    value={configForm.email}
                    onChange={(e) => setConfigForm({...configForm, email: e.target.value})}
                    className={`w-full px-4 py-2 text-sm border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={configForm.password}
                    onChange={(e) => setConfigForm({...configForm, password: e.target.value})}
                    className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveFirebaseConfig}
                    disabled={isSyncing}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {isSyncing ? 'Conectando...' : 'Conectar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSetup(false);
                      setSyncError('');
                    }}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

{showManagePeople && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className={`rounded-lg p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Gerenciar Pessoas</h3>
      
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {people.map(person => (
          <div key={person.id} className={`flex items-center justify-between p-3 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <span className={`px-3 py-1 rounded text-sm font-medium ${person.color}`}>
              {person.name}
            </span>
            {people.length > 1 && (
              <button
                onClick={() => deletePerson(person.id)}
                className={`transition-colors ${
                  darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Nome da pessoa"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addPerson()}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-800'
          }`}
        />
        <div className="flex gap-3">
          <button
            onClick={addPerson}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Adicionar Pessoa
          </button>
          <button
            onClick={() => {
              setShowManagePeople(false);
              setNewPersonName('');
            }}
            className={`px-6 py-3 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showManageCreditCards && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className={`rounded-lg p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-xl font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Gerenciar Cartões de Crédito</h3>
      
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {creditCards.map(card => (
          <div key={card.id} className={`flex items-center justify-between p-3 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div>
              <span className={`px-3 py-1 rounded text-sm font-medium ${card.color}`}>
                {card.name}
              </span>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Dono: {getPersonName(card.owner)} | Fechamento: dia {card.closingDay} | Vencimento: dia {card.dueDay}
              </p>
            </div>
            <button
              onClick={() => deleteCreditCard(card.id)}
              className={`transition-colors ${
                darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Nome do cartão"
          value={newCardData.name}
          onChange={(e) => setNewCardData({...newCardData, name: e.target.value})}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-800'
          }`}
        />
        <select
          value={newCardData.owner}
          onChange={(e) => setNewCardData({...newCardData, owner: parseInt(e.target.value)})}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200' 
              : 'bg-white border-gray-300 text-gray-800'
          }`}
        >
          {people.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dia Fechamento</label>
            <input
              type="number"
              min="1"
              max="31"
              value={newCardData.closingDay}
              onChange={(e) => setNewCardData({...newCardData, closingDay: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
          <div>
            <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dia Vencimento</label>
            <input
              type="number"
              min="1"
              max="31"
              value={newCardData.dueDay}
              onChange={(e) => setNewCardData({...newCardData, dueDay: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addCreditCard}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Adicionar Cartão
          </button>
          <button
            onClick={() => {
              setShowManageCreditCards(false);
              setNewCardData({ name: '', owner: people[0]?.id || 1, closingDay: 1, dueDay: 10 });
            }}
            className={`px-6 py-3 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal de Conflito de Dados */}
      {showConflictModal && conflictData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 max-w-lg w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="mb-4">
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                ⚠️ Conflito de Dados Detectado
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Encontramos dados diferentes no seu dispositivo e na nuvem. 
                Escolha qual versão deseja manter:
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Dados Locais */}
              <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    📱 Dados deste Dispositivo
                  </h4>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {conflictData.localDate.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>• Tarefas: {conflictData.local.tasks.length}</p>
                  <p>• Transações: {conflictData.local.transactions.length}</p>
                  <p>• Trabalhos: {conflictData.local.jobs.length}</p>
                  <p>• Tags: {conflictData.local.tags.length}</p>
                  <p>• Pessoas: {conflictData.local.people.length}</p>
                  <p>• Cartões: {conflictData.local.creditCards.length}</p>
                </div>
              </div>

              {/* Dados da Nuvem */}
              <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    ☁️ Dados da Nuvem
                  </h4>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mais recente
                  </span>
                </div>
                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>• Tarefas: {conflictData.cloud.tasks?.length || 0}</p>
                  <p>• Transações: {conflictData.cloud.transactions?.length || 0}</p>
                  <p>• Trabalhos: {conflictData.cloud.jobs?.length || 0}</p>
                  <p>• Tags: {conflictData.cloud.tags?.length || 0}</p>
                  <p>• Pessoas: {conflictData.cloud.people?.length || 0}</p>
                  <p>• Cartões: {conflictData.cloud.creditCards?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg mb-4 text-sm ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
              <strong>⚠️ Importante:</strong> A versão não escolhida será sobrescrita e perdida permanentemente.
            </div>

            <div className="flex gap-3">
              <button
                onClick={useLocalData}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                📱 Usar Dados Locais
              </button>
              <button
                onClick={useCloudData}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                ☁️ Usar Dados da Nuvem
              </button>
            </div>

            <p className={`text-xs text-center mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Dica: Geralmente os dados locais são mais recentes se você acabou de usar o app offline
            </p>
          </div>
        </div>
      )}

{/* Modal de Edição de Tarefa */}
{editingTask && editedTask && (
  <TaskEditModal
    task={editingTask}
    editedTask={editedTask}
    setEditedTask={setEditedTask}
    jobs={jobs}
    tags={tags}
    selectedEditTags={selectedEditTags}
    toggleEditTag={toggleEditTag}
    onSave={saveTaskEdit}
    onCancel={cancelTaskEdit}
    darkMode={darkMode}
  />
)}

{/* Modal de Edição de Transação */}
{editingTransaction && editedTransaction && (
  <TransactionEditModal
    transaction={editingTransaction}
    editedTransaction={editedTransaction}
    setEditedTransaction={setEditedTransaction}
    categories={financeCategories}
    jobs={jobs}
    people={people}
    creditCards={creditCards}
    onSave={saveTransactionEdit}
    onCancel={cancelTransactionEdit}
    darkMode={darkMode}
  />
)}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
