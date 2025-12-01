import pool from './src/config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
    try {
        console.log('🔄 Connecting to Aiven database...');

        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Connected to Aiven database successfully!');

        // Read SQL file
        const sqlPath = join(__dirname, 'setup_aiven_database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL statements and execute them
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`\n🔄 Executing ${statements.length} SQL statements...\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.includes('CREATE TABLE')) {
                const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
                console.log(`📦 Creating table: ${tableName}...`);
            } else if (statement.includes('INSERT INTO')) {
                console.log('👤 Creating admin user...');
            }

            try {
                await connection.query(statement);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log('   ⚠️  Already exists, skipping...');
                } else {
                    throw err;
                }
            }
        }

        connection.release();

        console.log('\n✅ Database setup completed successfully!');
        console.log('\n📊 Verifying tables...');

        const [tables] = await pool.query('SHOW TABLES');
        console.log(`\n✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        console.log('\n🎉 Your Aiven database is ready!');
        console.log('\n📝 Default admin credentials:');
        console.log('   Email: admin@tripshare.com');
        console.log('   Password: adminpassword');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error setting up database:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

setupDatabase();
