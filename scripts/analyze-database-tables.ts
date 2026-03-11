import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Tables defined in Prisma schema
const PRISMA_TABLES = [
  'users',
  'public_users',
  'team',
  'analysts',
  'subscribers',
  'bookings',
  'bootcamps',
  'bootcamp_lessons',
  'bootcamp_registrations',
  'plans',
  'subscriptions',
  'payment_methods',
  'billing_history',
  'reviews',
  'research_page_content',
  'shariah_tiles',
  'binance_credentials',
  'bootcamp_progress',
  // Prisma system tables (don't delete these)
  '_prisma_migrations',
];

// PostgreSQL system tables (should never be deleted)
const SYSTEM_TABLES = [
  'pg_stat_statements',
  'pg_catalog',
  'information_schema',
];

async function getAllTables(): Promise<string[]> {
  const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;
  
  return result.map(row => row.tablename);
}

async function getTableInfo(tableName: string) {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*)::bigint as count FROM "${tableName}"`
    );
    
    return {
      name: tableName,
      rowCount: Number(result[0]?.count || 0),
    };
  } catch (error) {
    // If we can't query the table, return 0 rows
    return {
      name: tableName,
      rowCount: 0,
    };
  }
}

async function deleteTable(tableName: string) {
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
    console.log(`✓ Deleted table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`✗ Error deleting table ${tableName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Analyzing PostgreSQL database tables...\n');
  console.log('=' .repeat(60));

  try {
    // Get all tables from database
    const allTables = await getAllTables();
    
    console.log(`\n📊 Found ${allTables.length} tables in database:\n`);
    
    // Get info for each table
    const tableInfo = await Promise.all(
      allTables.map(table => getTableInfo(table))
    );

    // Separate tables into categories
    const usedTables: typeof tableInfo = [];
    const unusedTables: typeof tableInfo = [];
    const systemTables: typeof tableInfo = [];

    for (const info of tableInfo) {
      // Skip Prisma migrations table
      if (info.name.startsWith('_prisma') || info.name === '_prisma_migrations') {
        systemTables.push(info);
      } else if (PRISMA_TABLES.includes(info.name)) {
        usedTables.push(info);
      } else {
        unusedTables.push(info);
      }
    }

    // Display results
    console.log('\n✅ TABLES IN USE (defined in Prisma schema):');
    console.log('-'.repeat(60));
    if (usedTables.length === 0) {
      console.log('  No tables found');
    } else {
      usedTables.forEach(t => {
        console.log(`  • ${t.name.padEnd(35)} ${t.rowCount.toString().padStart(10)} rows`);
      });
    }

    console.log('\n❌ UNUSED TABLES (not in Prisma schema):');
    console.log('-'.repeat(60));
    if (unusedTables.length === 0) {
      console.log('  ✓ No unused tables found!');
    } else {
      unusedTables.forEach(t => {
        console.log(`  • ${t.name.padEnd(35)} ${t.rowCount.toString().padStart(10)} rows`);
      });
    }

    console.log('\n🔧 SYSTEM TABLES (Prisma migrations):');
    console.log('-'.repeat(60));
    systemTables.forEach(t => {
      console.log(`  • ${t.name.padEnd(35)} ${t.rowCount.toString().padStart(10)} rows`);
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📈 SUMMARY:');
    console.log(`  Total tables: ${allTables.length}`);
    console.log(`  Tables in use: ${usedTables.length}`);
    console.log(`  Unused tables: ${unusedTables.length}`);
    console.log(`  System tables: ${systemTables.length}`);

    // Prompt for deletion if there are unused tables
    if (unusedTables.length > 0) {
      console.log('\n⚠️  WARNING: You have unused tables that are not defined in your Prisma schema.');
      console.log('\nTo delete unused tables, run this script with --delete flag:');
      console.log('  npm run analyze:db -- --delete');
      
      // Check if --delete flag is passed
      const shouldDelete = process.argv.includes('--delete') || process.argv.includes('-d');
      
      if (shouldDelete) {
        console.log('\n🗑️  DELETING UNUSED TABLES...\n');
        let deleted = 0;
        let failed = 0;
        
        for (const table of unusedTables) {
          const success = await deleteTable(table.name);
          if (success) {
            deleted++;
          } else {
            failed++;
          }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ DELETION COMPLETE:');
        console.log(`  Deleted: ${deleted}`);
        console.log(`  Failed: ${failed}`);
      }
    } else {
      console.log('\n✅ Your database is clean! All tables are in use.');
    }

  } catch (error) {
    console.error('\n✗ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

