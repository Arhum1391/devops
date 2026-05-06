import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Tables to delete (as specified by user)
const TABLES_TO_DELETE = [
  'billing_history',
  'binance_credentials',
  'bookings',
  'bootcamp_lessons',
  'bootcamp_progress',
  'bootcamp_registrations',
  'bootcamps',
  'payment_methods',
  'plans',
  'public_users',
  'research_page_content',
  'shariah_tiles',
  'subscribers',
  'subscriptions',
];

async function getTableRowCount(tableName: string): Promise<number> {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*)::bigint as count FROM "${tableName}"`
    );
    return Number(result[0]?.count || 0);
  } catch (error) {
    return 0;
  }
}

async function deleteTable(tableName: string): Promise<boolean> {
  try {
    // Use CASCADE to handle foreign key constraints
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
    return true;
  } catch (error) {
    console.error(`✗ Error deleting table ${tableName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🗑️  DELETING TABLES FROM DATABASE...\n');
  console.log('='.repeat(60));
  console.log(`⚠️  WARNING: This will permanently delete the following tables:`);
  TABLES_TO_DELETE.forEach(t => console.log(`   - ${t}`));
  console.log('='.repeat(60));
  console.log('');

  try {
    // First, show current row counts
    console.log('📊 Current table row counts:\n');
    for (const table of TABLES_TO_DELETE) {
      try {
        const count = await getTableRowCount(table);
        console.log(`  • ${table.padEnd(35)} ${count.toString().padStart(10)} rows`);
      } catch (error) {
        console.log(`  • ${table.padEnd(35)} (table may not exist)`);
      }
    }

    console.log('\n🗑️  Starting deletion...\n');
    console.log('-'.repeat(60));

    let deleted = 0;
    let failed = 0;
    const results: Array<{ table: string; success: boolean; error?: string }> = [];

    for (const table of TABLES_TO_DELETE) {
      try {
        const success = await deleteTable(table);
        if (success) {
          console.log(`✓ Deleted: ${table}`);
          deleted++;
          results.push({ table, success: true });
        } else {
          console.log(`✗ Failed: ${table}`);
          failed++;
          results.push({ table, success: false });
        }
      } catch (error: any) {
        console.log(`✗ Error deleting ${table}: ${error.message}`);
        failed++;
        results.push({ table, success: false, error: error.message });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ DELETION COMPLETE:\n');
    console.log(`  Successfully deleted: ${deleted} tables`);
    console.log(`  Failed: ${failed} tables`);

    if (failed > 0) {
      console.log('\n⚠️  Failed tables:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  • ${r.table}${r.error ? ` - ${r.error}` : ''}`);
      });
    }

    // Verify deletion
    console.log('\n🔍 Verifying deletion...\n');
    const remainingTables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename = ANY(${TABLES_TO_DELETE})
      ORDER BY tablename;
    `;

    if (remainingTables.length > 0) {
      console.log('⚠️  The following tables still exist:');
      remainingTables.forEach(t => console.log(`  • ${t.tablename}`));
    } else {
      console.log('✓ All specified tables have been deleted successfully!');
    }

  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

