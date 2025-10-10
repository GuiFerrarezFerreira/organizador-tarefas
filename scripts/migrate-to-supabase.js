const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// ============================================
// CONFIGURAÇÃO
// ============================================

// Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const firestore = admin.firestore();

// Supabase
const supabaseUrl = ''; // ex: https://xxxxx.supabase.co
const supabaseServiceKey = ''; // A chave SECRETA
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function mapFirebaseIdToPostgresId(firebaseId) {
  // Converter ID do Firebase (string) para número
  // Usando timestamp como ID
  return parseInt(firebaseId) || Date.now();
}

// ============================================
// FUNÇÃO PRINCIPAL DE MIGRAÇÃO
// ============================================

async function migrate() {
  try {
    console.log('🚀 Iniciando migração do Firestore para Supabase...\n');

    // Obter todos os usuários
    const usersSnapshot = await firestore.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado no Firestore.');
      return;
    }

    console.log(`📊 Encontrados ${usersSnapshot.size} usuários\n`);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      console.log(`\n👤 Migrando dados do usuário: ${userId}`);
      console.log('─'.repeat(50));

      // Obter subcolecções do usuário
      const dataDoc = await firestore
        .collection('users')
        .doc(userId)
        .collection('data')
        .get();

      for (const doc of dataDoc.docs) {
        const docId = doc.id;
        const data = doc.data();

        console.log(`\n📦 Processando: ${docId}`);

        try {
          // Migrar cada tipo de dado
          if (docId === 'jobs' && data.jobs) {
            await migrateJobs(userId, data.jobs);
          } else if (docId === 'tags' && data.tags) {
            await migrateTags(userId, data.tags);
          } else if (docId === 'tasks' && data.tasks) {
            await migrateTasks(userId, data.tasks);
          } else if (docId === 'people' && data.people) {
            await migratePeople(userId, data.people);
          } else if (docId === 'creditCards' && data.cards) {
            await migrateCreditCards(userId, data.cards);
          } else if (docId === 'financeCategories' && data.categories) {
            await migrateFinanceCategories(userId, data.categories);
          } else if (docId === 'transactions' && data.transactions) {
            await migrateTransactions(userId, data.transactions);
          }
        } catch (error) {
          console.error(`   ❌ Erro ao migrar ${docId}:`, error.message);
        }
      }
    }

    console.log('\n\n✅ Migração concluída com sucesso!');
    console.log('🔍 Verifique os dados no Supabase Dashboard');
    
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
  } finally {
    process.exit();
  }
}

// ============================================
// FUNÇÕES DE MIGRAÇÃO POR ENTIDADE
// ============================================

async function migrateJobs(userId, jobs) {
  const jobsData = jobs.map(job => ({
    id: mapFirebaseIdToPostgresId(job.id),
    user_id: userId,
    name: job.name,
    color: job.color
  }));

  const { error } = await supabase
    .from('jobs')
    .upsert(jobsData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${jobs.length} trabalhos migrados`);
}

async function migrateTags(userId, tags) {
  const tagsData = tags.map(tag => ({
    id: mapFirebaseIdToPostgresId(tag.id),
    user_id: userId,
    name: tag.name,
    color: tag.color
  }));

  const { error } = await supabase
    .from('tags')
    .upsert(tagsData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${tags.length} tags migradas`);
}

async function migrateTasks(userId, tasks) {
  const tasksData = tasks.map(task => ({
    id: mapFirebaseIdToPostgresId(task.id),
    user_id: userId,
    title: task.title,
    description: task.description || null,
    job_id: task.jobId ? mapFirebaseIdToPostgresId(task.jobId) : null,
    type: task.type,
    date: task.date,
    time: task.time || null,
    completed: task.completed || false,
    tags: task.tags || []
  }));

  const { error } = await supabase
    .from('tasks')
    .upsert(tasksData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${tasks.length} tarefas migradas`);
}

async function migratePeople(userId, people) {
  const peopleData = people.map(person => ({
    id: mapFirebaseIdToPostgresId(person.id),
    user_id: userId,
    name: person.name,
    color: person.color
  }));

  const { error } = await supabase
    .from('people')
    .upsert(peopleData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${people.length} pessoas migradas`);
}

async function migrateCreditCards(userId, cards) {
  const cardsData = cards.map(card => ({
    id: mapFirebaseIdToPostgresId(card.id),
    user_id: userId,
    name: card.name,
    owner_id: mapFirebaseIdToPostgresId(card.owner),
    closing_day: card.closingDay,
    due_day: card.dueDay,
    color: card.color
  }));

  const { error } = await supabase
    .from('credit_cards')
    .upsert(cardsData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${cards.length} cartões migrados`);
}

async function migrateFinanceCategories(userId, categories) {
  const categoriesData = categories.map(cat => ({
    id: mapFirebaseIdToPostgresId(cat.id),
    user_id: userId,
    name: cat.name,
    type: cat.type,
    color: cat.color
  }));

  const { error } = await supabase
    .from('finance_categories')
    .upsert(categoriesData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${categories.length} categorias migradas`);
}

async function migrateTransactions(userId, transactions) {
  const transactionsData = transactions.map(t => ({
    id: mapFirebaseIdToPostgresId(t.id),
    user_id: userId,
    type: t.type,
    category_id: mapFirebaseIdToPostgresId(t.categoryId),
    amount: t.amount,
    description: t.description || null,
    date: t.date,
    job_id: t.jobId ? mapFirebaseIdToPostgresId(t.jobId) : null,
    completed: t.completed || false,
    payment_method: t.paymentMethod || 'checking',
    credit_card_id: t.creditCardId ? mapFirebaseIdToPostgresId(t.creditCardId) : null,
    owner_id: mapFirebaseIdToPostgresId(t.ownerId),
    is_recurring: t.isRecurring || false,
    recurring_type: t.recurringType || null,
    is_installment: t.isInstallment || false,
    installment_count: t.installmentCount || 1,
    current_installment: t.currentInstallment || 1,
    parent_transaction_id: t.parentTransactionId ? mapFirebaseIdToPostgresId(t.parentTransactionId) : null
  }));

  const { error } = await supabase
    .from('transactions')
    .upsert(transactionsData, { onConflict: 'id' });

  if (error) throw error;
  console.log(`   ✅ ${transactions.length} transações migradas`);
}

// ============================================
// EXECUTAR MIGRAÇÃO
// ============================================

migrate();
