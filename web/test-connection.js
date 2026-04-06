const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.xxqqxicusvhmtubjchft:CHMSUIS2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function testConnection() {
  console.log('Testing Supabase connection...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('✅ PostgreSQL Version:', result.rows[0].version);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`\n📊 Found ${tablesResult.rows.length} tables in public schema:`);
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    client.release();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
