import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, Briefcase, Moon, Sun, Cloud, CloudOff } from 'lucide-react';
import { initializeFirebase, loginUser, saveTasks, saveJobs, loadTasks, loadJobs, subscribeToTasks, subscribeToJobs } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [viewMode, setViewMode] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddTask, setShowAddTask] = useState(false);
  const [showManageJobs, setShowManageJobs] = useState(false);
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
  
const [jobs, setJobs] = useState([
  { id: 1, name: 'Trabalho Fixo 1', color: 'bg-blue-100 text-blue-700' },
  { id: 2, name: 'Trabalho Fixo 2', color: 'bg-green-100 text-green-700' },
  { id: 3, name: 'Freelancers', color: 'bg-purple-100 text-purple-700' }
]);

  const [newJobName, setNewJobName] = useState('');
  
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
  
const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState({
    title: '',
    jobId: 1,
    type: 'projeto',
    date: new Date().toISOString().split('T')[0],
    time: ''
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

  // Salvar dados localmente
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

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

  // Inicializar Firebase e carregar dados
  useEffect(() => {
    if (firebaseConfig && userId) {
      initializeAndSync();
    }
  }, [firebaseConfig, userId]);

  const initializeAndSync = async () => {
    const initialized = initializeFirebase(firebaseConfig);
    if (initialized) {
      setIsOnline(true);
      
      // Carregar dados da nuvem
      const cloudTasks = await loadTasks(userId);
      const cloudJobs = await loadJobs(userId);
      
      if (cloudTasks) {
        setTasks(cloudTasks);
      }
      if (cloudJobs) {
        setJobs(cloudJobs);
      }
      
      setIsLoaded(true); 
      
      // Subscrever para mudanças em tempo real
      const unsubscribeTasks = subscribeToTasks(userId, (newTasks) => {
        setTasks(newTasks);
      });
      
      const unsubscribeJobs = subscribeToJobs(userId, (newJobs) => {
        setJobs(newJobs);
      });
      
      return () => {
        unsubscribeTasks();
        unsubscribeJobs();
      };
    }
  };

// Sincronizar mudanças com Firebase
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isOnline && userId && isLoaded) {
      const syncTimeout = setTimeout(() => {
        saveTasks(userId, tasks);
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [tasks, isOnline, userId, isLoaded]);

  useEffect(() => {
    if (isOnline && userId && isLoaded) {
      const syncTimeout = setTimeout(() => {
        saveJobs(userId, jobs);
      }, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [jobs, isOnline, userId, isLoaded]);

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
    
    const initialized = initializeFirebase(config);
    if (!initialized) {
      setSyncError('Erro ao conectar com Firebase. Verifique as configurações.');
      setIsSyncing(false);
      return;
    }
    
    const result = await loginUser(configForm.email, configForm.password);
    if (result.success) {
      localStorage.setItem('firebaseConfig', JSON.stringify(config));
      setFirebaseConfig(config);
      setUserEmail(configForm.email);
      setUserId(result.user.uid);
      
      // Enviar dados locais para a nuvem
      await saveTasks(result.user.uid, tasks);
      await saveJobs(result.user.uid, jobs);
      
      setIsOnline(true);
      setShowSetup(false);
      setSyncError('');
    } else {
      setSyncError('Erro no login: ' + result.error);
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
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        ...newTask, 
        completed: false 
      }]);
      setNewTask({
        title: '',
        jobId: jobs[0]?.id || 1,
        type: 'projeto',
        date: new Date().toISOString().split('T')[0],
        time: ''
      });
      setShowAddTask(false);
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
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
    }
  };

  const deleteJob = (jobId) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter(job => job.id !== jobId));
      setTasks(tasks.filter(task => task.jobId !== jobId));
      if (activeTab === jobId.toString()) {
        setActiveTab('daily');
      }
    }
  };

  const getJobColor = (jobId) => {
    return jobs.find(j => j.id === jobId)?.color || 'bg-gray-100 text-gray-700';
  };

  const getJobName = (jobId) => {
    return jobs.find(j => j.id === jobId)?.name || '';
  };

  const filterTasks = () => {
    if (activeTab === 'daily' || activeTab === 'weekly') {
      const today = new Date().toISOString().split('T')[0];
      if (viewMode === 'daily') {
        return tasks.filter(task => task.date === today);
      } else if (viewMode === 'weekly') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= new Date() && taskDate <= weekFromNow;
        });
      } else if (viewMode === 'monthly') {
        return tasks.filter(task => task.date.startsWith(selectedMonth));
      }
    } else {
      const jobId = parseInt(activeTab);
      const today = new Date().toISOString().split('T')[0];
      
      let filteredByJob = tasks.filter(task => task.jobId === jobId);
      
      if (viewMode === 'daily') {
        return filteredByJob.filter(task => task.date === today);
      } else if (viewMode === 'weekly') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return filteredByJob.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= new Date() && taskDate <= weekFromNow;
        });
      } else if (viewMode === 'monthly') {
        return filteredByJob.filter(task => task.date.startsWith(selectedMonth));
      }
      
      return filteredByJob;
    }
  };

  const filteredTasks = filterTasks();
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-light mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Minhas Tarefas</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Organização simples e clara</p>
            </div>
            <div className="flex gap-2">
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
          </div>
        </div>

        {activeTab === 'daily' && (
          <div className="mb-6 space-y-3">
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
            </div>
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
        )}

        {activeTab !== 'daily' && (
          <div className="mb-6 space-y-3">
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
            </div>
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
        )}

        <div className="space-y-3">
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getJobColor(task.jobId)}`}>
                      {getJobName(task.jobId)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.type}
                    </span>
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
    </div>
  );
}
