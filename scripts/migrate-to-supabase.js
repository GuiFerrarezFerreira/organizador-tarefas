// Execute: node scripts/migrate-to-supabase.js

const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// Configurar Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Configurar Supabase
const supabase = createClient(
  'https://sxfkuuqczgspvgvlnhsp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Zmt1dXFjemdzcHZndmxuaHNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAyMTI0MywiZXhwIjoyMDc1NTk3MjQzfQ.C2bV_wQlMA6BrO4OFCMi1YHQcFqSEma9MW9jPUufvt4' // Use Service Role Key, não anon key!
);

async function migrate() {
  console.log('Iniciando migração...');
  
  // Obter dados do Firestore
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    console.log(`Migrando dados do usuário ${userId}...`);
    
    const userData = userDoc.data();
    
    // Migrar cada coleção
    if (userData.tasks) {
      await supabase.from('tasks').insert(
        userData.tasks.map(t => ({ ...t, user_id: userId }))
      );
    }
    
    if (userData.jobs) {
      await supabase.from('jobs').insert(
        userData.jobs.map(j => ({ ...j, user_id: userId }))
      );
    }
    
    // Continue para tags, transactions, etc...
  }
  
  console.log('Migração concluída!');
}

migrate().catch(console.error);
