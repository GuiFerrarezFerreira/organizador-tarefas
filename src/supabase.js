import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ''; // Cole a Project URL aqui
const supabaseAnonKey = ''; // Cole a anon key aqui

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTENTICAÇÃO
// ============================================

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error };
};

// ============================================
// FUNÇÕES GENÉRICAS
// ============================================

const saveData = async (table, data) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Adiciona user_id em todos os itens
    const dataWithUserId = Array.isArray(data) 
      ? data.map(item => ({ ...item, user_id: user.id }))
      : { ...data, user_id: user.id };

    const { error } = await supabase
      .from(table)
      .upsert(dataWithUserId, { onConflict: 'id' });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Erro ao salvar ${table}:`, error);
    return { success: false, error: error.message };
  }
};

const loadData = async (table) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error(`Erro ao carregar ${table}:`, error);
    return { success: false, error: error.message };
  }
};

const deleteData = async (table, id) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Erro ao deletar de ${table}:`, error);
    return { success: false, error: error.message };
  }
};

const subscribeToData = (table, callback) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: table 
      },
      async (payload) => {
        // Recarrega todos os dados quando há mudança
        const result = await loadData(table);
        if (result.success) {
          callback(result.data);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// ============================================
// JOBS
// ============================================

export const saveJobs = async (jobs) => saveData('jobs', jobs);
export const loadJobs = async () => loadData('jobs');
export const deleteJob = async (id) => deleteData('jobs', id);
export const subscribeToJobs = (callback) => subscribeToData('jobs', callback);

// ============================================
// TAGS
// ============================================

export const saveTags = async (tags) => saveData('tags', tags);
export const loadTags = async () => loadData('tags');
export const deleteTag = async (id) => deleteData('tags', id);
export const subscribeToTags = (callback) => subscribeToData('tags', callback);

// ============================================
// TASKS
// ============================================

export const saveTasks = async (tasks) => saveData('tasks', tasks);
export const loadTasks = async () => loadData('tasks');
export const deleteTask = async (id) => deleteData('tasks', id);
export const subscribeToTasks = (callback) => subscribeToData('tasks', callback);

// ============================================
// PEOPLE
// ============================================

export const savePeople = async (people) => saveData('people', people);
export const loadPeople = async () => loadData('people');
export const deletePerson = async (id) => deleteData('people', id);
export const subscribeToPeople = (callback) => subscribeToData('people', callback);

// ============================================
// CREDIT CARDS
// ============================================

export const saveCreditCards = async (cards) => saveData('credit_cards', cards);
export const loadCreditCards = async () => loadData('credit_cards');
export const deleteCreditCard = async (id) => deleteData('credit_cards', id);
export const subscribeToCreditCards = (callback) => subscribeToData('credit_cards', callback);

// ============================================
// FINANCE CATEGORIES
// ============================================

export const saveFinanceCategories = async (categories) => saveData('finance_categories', categories);
export const loadFinanceCategories = async () => loadData('finance_categories');
export const deleteFinanceCategory = async (id) => deleteData('finance_categories', id);
export const subscribeToFinanceCategories = (callback) => subscribeToData('finance_categories', callback);

// ============================================
// TRANSACTIONS
// ============================================

export const saveTransactions = async (transactions) => saveData('transactions', transactions);
export const loadTransactions = async () => loadData('transactions');
export const deleteTransaction = async (id) => deleteData('transactions', id);
export const subscribeToTransactions = (callback) => subscribeToData('transactions', callback);
