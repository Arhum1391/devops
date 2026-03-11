import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

/** Fix invalid ARRAY in schema - PostgreSQL requires TEXT[] not ARRAY */
function fixSchema(schema: string): string {
  return schema.replace(/\bARRAY\b/g, 'TEXT[]');
}

/** Format value for PostgreSQL INSERT */
function formatValue(v: unknown): string {
  if (v === null) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (Array.isArray(v)) {
    const escaped = v.map((x) => `'${String(x).replace(/'/g, "''")}'`);
    return `ARRAY[${escaped.join(', ')}]::TEXT[]`;
  }
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

/** Tables with data, in dependency order (parents before children) */
const INSERT_ORDER = [
  'public_users',
  'plans',
  'bootcamps',
  'subscribers',
  'subscriptions',
  'binance_credentials',
  'billing_history',
  'bookings',
  'bootcamp_registrations',
  'bootcamp_lessons',
  'bootcamp_progress',
  'reviews',
  'research_page_content',
  'shariah_tiles',
  'team',
  'analysts',
  'users',
];

async function restoreFromMetadata(metadataFile: string) {
  console.log(`📂 Loading backup from: ${metadataFile}\n`);

  const metadata = JSON.parse(readFileSync(metadataFile, 'utf-8'));

  console.log(`📅 Backup timestamp: ${metadata.timestamp}`);
  console.log(`📊 Tables in backup: ${metadata.tables.length}\n`);

  try {
    // Phase 1: Create all table schemas
    for (const tableInfo of metadata.tables) {
      console.log(`Creating schema: ${tableInfo.name}...`);
      if (tableInfo.schema && !tableInfo.schema.startsWith('-- Error')) {
        try {
          const fixedSchema = fixSchema(tableInfo.schema);
          await prisma.$executeRawUnsafe(fixedSchema);
          console.log(`  ✓ Table schema created`);
        } catch (error: any) {
          console.log(`  ✗ Schema error: ${error.message.substring(0, 80)}`);
        }
      }
    }

    console.log('\n--- Inserting data ---\n');

    // Phase 2: Insert data in dependency order
    for (const tableName of INSERT_ORDER) {
      const tableData = metadata.fullData?.[tableName];
      if (!tableData || tableData.length === 0) continue;

      console.log(`Inserting into ${tableName} (${tableData.length} rows)...`);
      let inserted = 0;
      for (const row of tableData) {
        try {
          const columns = Object.keys(row).map((k) => `"${k}"`).join(', ');
          const values = Object.values(row).map(formatValue).join(', ');

          await prisma.$executeRawUnsafe(
            `INSERT INTO "${tableName}" (${columns}) VALUES (${values}) ON CONFLICT (id) DO NOTHING`
          );
          inserted++;
        } catch (error: any) {
          console.warn(`  ⚠ Skipped row: ${error.message.substring(0, 60)}`);
        }
      }
      console.log(`  ✓ Inserted ${inserted}/${tableData.length} rows\n`);
    }

    console.log('✅ Restore complete!');
  } catch (error) {
    console.error('\n✗ Fatal error during restore:', error);
    throw error;
  }
}

async function main() {
  const backupDir = join(process.cwd(), 'database-backup');

  console.log('🔄 RESTORING TABLES FROM BACKUP...\n');
  console.log('='.repeat(60));

  try {
    // Find the most recent metadata file
    const files = readdirSync(backupDir)
      .filter(f => f.startsWith('metadata_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('❌ No backup files found in database-backup directory');
      console.log('   Please run: npm run backup:tables first');
      process.exit(1);
    }

    const latestBackup = files[0];
    const metadataFile = join(backupDir, latestBackup);

    console.log(`📦 Found backup: ${latestBackup}\n`);

    await restoreFromMetadata(metadataFile);

  } catch (error) {
    console.error('\n✗ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

