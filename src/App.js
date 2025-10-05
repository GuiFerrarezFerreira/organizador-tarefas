import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, Briefcase, Moon, Sun, Cloud, CloudOff, Wifi, WifiOff, AlertCircle, CheckCircle, Tag, Search, Filter, SlidersHorizontal, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { initializeFirebase, loginUser, saveTasks, saveJobs, loadTasks, loadJobs, subscribeToTasks, subscribeToJobs, saveTags, loadTags, subscribeToTags, saveTransactions, loadTransactions, subscribeToTransactions, saveFinanceCategories, loadFinanceCategories, subscribeToFinanceCategories, savePeople, loadPeople, subscribeToPeople, saveCreditCards, loadCreditCards, subscribeToCreditCards } from './firebase';

// Componente de Resumo Financeiro
const FinanceSummary = ({ transactions, darkMode }) => {
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const calculateTotals = () => {
    return transactions.reduce((acc, t) => {
      if (t.completed) {
        if (t.type === 'receita') {
          acc.income += t.amount;
        } else {
          acc.expense += t.amount;
        }
      }
      return acc;f
    }, { income: 0, expense: 0 });
  };

  const { income, expense } = calculateTotals();
  const balance = income - expense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={`rounded-lg p-6 ${
        darkMode 
          ? 'bg-gradient-to-br from-green-900 to-green-800' 
          : 'bg-gradient-to-br from-green-50 to-green-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            darkMode ? 'text-green-200' : 'text-green-700'
          }`}>
            Receitas
          </span>
          <TrendingUp size={20} className={darkMode ? 'text-green-300' : 'text-green-600'} />
        </div>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-green-100' : 'text-green-700'
        }`}>
          {formatCurrency(income)}
        </div>
      </div>

      <div className={`rounded-lg p-6 ${
        darkMode 
          ? 'bg-gradient-to-br from-red-900 to-red-800' 
          : 'bg-gradient-to-br from-red-50 to-red-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            darkMode ? 'text-red-200' : 'text-red-700'
          }`}>
            Despesas
          </span>
          <TrendingDown size={20} className={darkMode ? 'text-red-300' : 'text-red-600'} />
        </div>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-red-100' : 'text-red-700'
        }`}>
          {formatCurrency(expense)}
        </div>
      </div>

      <div className={`rounded-lg p-6 ${
        balance >= 0
          ? darkMode 
            ? 'bg-gradient-to-br from-blue-900 to-blue-800' 
            : 'bg-gradient-to-br from-blue-50 to-blue-100'
          : darkMode
            ? 'bg-gradient-to-br from-orange-900 to-orange-800'
            : 'bg-gradient-to-br from-orange-50 to-orange-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            balance >= 0
              ? darkMode ? 'text-blue-200' : 'text-blue-700'
              : darkMode ? 'text-orange-200' : 'text-orange-700'
          }`}>
            Saldo
          </span>
          <DollarSign size={20} className={
            balance >= 0
              ? darkMode ? 'text-blue-300' : 'text-blue-600'
              : darkMode ? 'text-orange-300' : 'text-orange-600'
          } />
        </div>
        <div className={`text-2xl font-bold ${
          balance >= 0
            ? darkMode ? 'text-blue-100' : 'text-blue-700'
            : darkMode ? 'text-orange-100' : 'text-orange-700'
        }`}>
          {formatCurrency(balance)}
        </div>
      </div>
    </div>
  );
};

// Componente de Lista de Transações
const FinanceList = ({ 
  transactions, 
  onToggle, 
  onDelete, 
  getCategoryColor, 
  getCategoryName,
  getJobName,
  darkMode 
}) => {
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <div
          key={transaction.id}
          className={`rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } ${!transaction.completed && 'opacity-70'}`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onToggle(transaction.id)}
              className={`mt-1 p-1 rounded transition-colors ${
                transaction.completed
                  ? transaction.type === 'receita'
                    ? 'text-green-500 hover:text-green-600'
                    : 'text-red-500 hover:text-red-600'
                  : darkMode
                  ? 'text-gray-600 hover:text-gray-500'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              {transaction.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-lg font-medium ${
                      transaction.type === 'receita'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {transaction.type === 'receita' ? '💚' : '❤️'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.categoryId)}`}>
                      {getCategoryName(transaction.categoryId)}
                    </span>
                    {transaction.jobId && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Briefcase size={10} className="inline mr-1" />
                        {getJobName(transaction.jobId)}
                      </span>
                    )}
                    {!transaction.completed && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        Pendente
                      </span>
                    )}
                  </div>
                  <p className={`mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {transaction.description || 'Sem descrição'}
                  </p>
                  <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className={`text-xl font-bold ${
                    transaction.type === 'receita'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onDelete(transaction.id)}
              className={`transition-colors ${
                darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className={`rounded-lg p-12 text-center ${
          darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'
        }`}>
          <div className="text-6xl mb-4">💰</div>
          <p>Nenhuma transação para mostrar</p>
        </div>
      )}
    </div>
  );
};

// Componente de Formulário de Transação
const FinanceForm = ({ 
  newTransaction, 
  setNewTransaction, 
  categories, 
  jobs,
  onSubmit, 
  onCancel, 
  darkMode 
}) => {
  const formatCurrencyInput = (value) => {
    const numbers = value.replace(/\D/g, '');
    const cents = parseInt(numbers) || 0;
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleAmountChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    const cents = Math.round(parseFloat(formatted.replace(',', '.')) * 100);
    setNewTransaction({ ...newTransaction, amount: cents });
  };

  const filteredCategories = categories.filter(cat => 
    cat.type === newTransaction.type || cat.type === 'ambos'
  );

  return (
    <div className={`mt-6 rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Nova Transação
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tipo
            </label>
            <select
              value={newTransaction.type}
              onChange={(e) => {
                const newType = e.target.value;
                const newFilteredCategories = categories.filter(cat => 
                  cat.type === newType || cat.type === 'ambos'
                );
                setNewTransaction({ 
                  ...newTransaction, 
                  type: newType,
                  categoryId: newFilteredCategories[0]?.id || null
                });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="receita">💚 Receita</option>
              <option value="despesa">❤️ Despesa</option>
            </select>
          </div>
          
          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Categoria
            </label>
            <select
              value={newTransaction.categoryId}
              onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: parseInt(e.target.value) })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Valor
          </label>
          <div className="relative">
            <span className={`absolute left-4 top-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              R$
            </span>
            <input
              type="text"
              value={formatCurrencyInput(newTransaction.amount.toString())}
              onChange={handleAmountChange}
              placeholder="0,00"
              className={`w-full pl-12 pr-4 py-3 border rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Descrição
          </label>
          <input
            type="text"
            placeholder="Ex: Pagamento cliente X"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Data
            </label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>

          <div>
            <label className={`text-sm mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Trabalho (opcional)
            </label>
            <select
              value={newTransaction.jobId || ''}
              onChange={(e) => setNewTransaction({ ...newTransaction, jobId: e.target.value ? parseInt(e.target.value) : null })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="">Nenhum</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="completed"
            checked={newTransaction.completed}
            onChange={(e) => setNewTransaction({ ...newTransaction, completed: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="completed" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {newTransaction.type === 'receita' ? 'Receita já recebida' : 'Despesa já paga'}
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Adicionar
          </button>
          <button
            onClick={onCancel}
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
  );
};

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
    ownerId: people[0]?.id || 1
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
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financeCategories', JSON.stringify(financeCategories));
  }, [financeCategories]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people));
    }, [people]);

useEffect(() => {
  localStorage.setItem('creditCards', JSON.stringify(creditCards));
}, [creditCards]);
  useEffect(() => {
    if (firebaseConfig && userId) {
      initializeAndSync();
    }
  }, [firebaseConfig, userId]);

  const initializeAndSync = async () => {
    const result = initializeFirebase(firebaseConfig);
    
    if (!result.success) {
      addNotification(result.error, 'error');
      return;
    }
    
    setIsOnline(true);
    addNotification('Conectado à nuvem', 'success');
    
    const tasksResult = await loadTasks(userId);
    const jobsResult = await loadJobs(userId);
    const tagsResult = await loadTags(userId);
    const transactionsResult = await loadTransactions(userId);
    const financeCategoriesResult = await loadFinanceCategories(userId);
    const peopleResult = await loadPeople(userId);
    const creditCardsResult = await loadCreditCards(userId);
    
    if (tasksResult.success && tasksResult.data) {
      setTasks(tasksResult.data);
    } else if (!tasksResult.success) {
      addNotification(tasksResult.error, 'warning');
    }
    
    if (jobsResult.success && jobsResult.data) {
      setJobs(jobsResult.data);
    } else if (!jobsResult.success) {
      addNotification(jobsResult.error, 'warning');
    }

    if (tagsResult.success && tagsResult.data) {
      setTags(tagsResult.data);
    } else if (!tagsResult.success) {
      addNotification(tagsResult.error, 'warning');
    }

    if (transactionsResult.success && transactionsResult.data) {
      setTransactions(transactionsResult.data);
    } else if (!transactionsResult.success) {
      addNotification(transactionsResult.error, 'warning');
    }

    if (financeCategoriesResult.success && financeCategoriesResult.data) {
      setFinanceCategories(financeCategoriesResult.data);
    } else if (!financeCategoriesResult.success) {
      addNotification(financeCategoriesResult.error, 'warning');
    }

    if (peopleResult.success && peopleResult.data) {
      setPeople(peopleResult.data);
    } else if (!peopleResult.success) {
      addNotification(peopleResult.error, 'warning');
    }

    if (creditCardsResult.success && creditCardsResult.data) {
      setCreditCards(creditCardsResult.data);
    } else if (!creditCardsResult.success) {
      addNotification(creditCardsResult.error, 'warning');
    }
    setIsLoaded(true);
    
    const unsubscribeTasks = subscribeToTasks(
      userId,
      (newTasks) => {
        setTasks(newTasks);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );
    
    const unsubscribeJobs = subscribeToJobs(
      userId,
      (newJobs) => {
        setJobs(newJobs);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );

    const unsubscribeTags = subscribeToTags(
      userId,
      (newTags) => {
        setTags(newTags);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );

    const unsubscribeTransactions = subscribeToTransactions(
      userId,
      (newTransactions) => {
        setTransactions(newTransactions);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );

    const unsubscribeFinanceCategories = subscribeToFinanceCategories(
      userId,
      (newCategories) => {
        setFinanceCategories(newCategories);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );

    const unsubscribePeople = subscribeToPeople(
      userId,
      (newPeople) => {
        setPeople(newPeople);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );

    const unsubscribeCreditCards = subscribeToCreditCards(
      userId,
      (newCards) => {
        setCreditCards(newCards);
      },
      (error) => {
        addNotification(error, 'error');
      }
    );
    
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

  useEffect(() => {
    if (isOnline && userId && isLoaded && networkStatus) {
      const syncTimeout = setTimeout(async () => {
        const result = await saveTasks(userId, tasks);
        if (!result.success) {
          addNotification(result.error, 'warning');
        }
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [tasks, isOnline, userId, isLoaded, networkStatus]);

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
    
    const config = {
      apiKey: configForm.apiKey,
      authDomain: configForm.authDomain,
      projectId: configForm.projectId,
      storageBucket: configForm.storageBucket,
      messagingSenderId: configForm.messagingSenderId,
      appId: configForm.appId
    };
    
    const initResult = initializeFirebase(config);
    if (!initResult.success) {
      setSyncError(initResult.error);
      setIsSyncing(false);
      return;
    }
    
    const result = await loginUser(configForm.email, configForm.password);
    if (result.success) {
      localStorage.setItem('firebaseConfig', JSON.stringify(config));
      setFirebaseConfig(config);
      setUserEmail(configForm.email);
      setUserId(result.user.uid);
      
      await saveTasks(result.user.uid, tasks);
      await saveJobs(result.user.uid, jobs);
      await saveTags(result.user.uid, tags);
      await saveTransactions(result.user.uid, transactions);
      await saveFinanceCategories(result.user.uid, financeCategories);
      await savePeople(result.user.uid, people);
      await saveCreditCards(result.user.uid, creditCards);
      
      setIsOnline(true);
      setShowSetup(false);
      setSyncError('');
      addNotification('Conectado com sucesso!', 'success');
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
      setTransactions([...transactions, { 
        id: Date.now(), 
        ...newTransaction
      }]);
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
        ownerId: people[0]?.id || 1
      });
      setShowAddTransaction(false);
      addNotification('Transação adicionada', 'success');
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
            <FinanceSummary transactions={sortedTransactions} darkMode={darkMode} />

            <div className="mb-6 flex items-center justify-between">
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

            <FinanceList
              transactions={sortedTransactions}
              onToggle={toggleTransaction}
              onDelete={deleteTransaction}
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
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`transition-colors ${
                        darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <X size={20} />
                    </button>
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
