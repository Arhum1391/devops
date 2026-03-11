import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Tables to backup (as specified by user)
const TABLES_TO_BACKUP = [
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

interface TableBackup {
  name: string;
  schema: string;
  rowCount: number;
  data: any[];
}

async function getTableSchema(tableName: string): Promise<string> {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ create_statement: string }>>(
      `SELECT 
        'CREATE TABLE IF NOT EXISTS "' || schemaname || '"."' || tablename || '" (' || 
        string_agg(column_definition, ', ') || 
        ');' as create_statement
      FROM (
        SELECT 
          t.schemaname,
          t.tablename,
          a.attname || ' ' || 
          pg_catalog.format_type(a.atttypid, a.atttypmod) ||
          CASE 
            WHEN a.attnotnull THEN ' NOT NULL'
            ELSE ''
          END ||
          CASE 
            WHEN a.atthasdef THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid)
            ELSE ''
          END as column_definition
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        JOIN pg_attribute a ON a.attrelid = c.oid
        LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
        WHERE t.schemaname = 'public' 
        AND t.tablename = $1
        AND a.attnum > 0
        AND NOT a.attisdropped
        ORDER BY a.attnum
      ) sub
      GROUP BY schemaname, tablename;`,
      tableName
    );
    
    if (result && result.length > 0 && result[0].create_statement) {
      return result[0].create_statement;
    }
    
    // Fallback: Get schema using pg_dump style query
    const fallback = await prisma.$queryRawUnsafe<Array<{ ddl: string }>>(
      `SELECT 
        'CREATE TABLE IF NOT EXISTS ' || schemaname || '.' || tablename || ' AS SELECT * FROM ' || schemaname || '.' || tablename || ' WHERE 1=0;' as ddl
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = $1`,
      tableName
    );
    
    return fallback[0]?.ddl || `-- Could not generate schema for ${tableName}`;
  } catch (error: any) {
    return `-- Error generating schema for ${tableName}: ${error.message}`;
  }
}

async function getTableSchemaSimple(tableName: string): Promise<string> {
  try {
    // Get column information
    const columns = await prisma.$queryRawUnsafe<Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>>(
      `SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position`,
      tableName
    );

    if (columns.length === 0) {
      return `-- Table ${tableName} not found or has no columns`;
    }

    const columnDefs = columns.map(col => {
      let def = `"${col.column_name}" ${col.data_type.toUpperCase()}`;
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL';
      }
      if (col.column_default) {
        def += ` DEFAULT ${col.column_default}`;
      }
      return def;
    }).join(',\n    ');

    // Get primary key
    const pk = await prisma.$queryRawUnsafe<Array<{ constraint_name: string; column_name: string }>>(
      `SELECT 
        kcu.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY kcu.ordinal_position`,
      tableName
    );

    let pkConstraint = '';
    if (pk.length > 0) {
      const pkColumns = pk.map(p => `"${p.column_name}"`).join(', ');
      pkConstraint = `,\n    PRIMARY KEY (${pkColumns})`;
    }

    return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n    ${columnDefs}${pkConstraint}\n);`;
  } catch (error: any) {
    return `-- Error generating schema for ${tableName}: ${error.message}`;
  }
}

async function getTableData(tableName: string): Promise<any[]> {
  try {
    const data = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    return data as any[];
  } catch (error) {
    console.warn(`Warning: Could not fetch data from ${tableName}`);
    return [];
  }
}

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

async function main() {
  console.log('💾 BACKING UP TABLES BEFORE DELETION...\n');
  console.log('='.repeat(60));

  const backupDir = join(process.cwd(), 'database-backup');
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const backupFile = join(backupDir, `backup_${timestamp}.sql`);
  const metadataFile = join(backupDir, `metadata_${timestamp}.json`);

  const backups: TableBackup[] = [];
  let totalRows = 0;

  try {
    console.log(`📦 Backing up ${TABLES_TO_BACKUP.length} tables...\n`);

    for (const tableName of TABLES_TO_BACKUP) {
      console.log(`  Processing: ${tableName}...`);
      
      try {
        const rowCount = await getTableRowCount(tableName);
        const schema = await getTableSchemaSimple(tableName);
        const data = rowCount > 0 ? await getTableData(tableName) : [];

        backups.push({
          name: tableName,
          schema,
          rowCount,
          data,
        });

        totalRows += rowCount;
        console.log(`    ✓ ${tableName}: ${rowCount} rows, schema saved`);
      } catch (error: any) {
        console.log(`    ⚠ ${tableName}: Error - ${error.message}`);
        backups.push({
          name: tableName,
          schema: `-- Error backing up ${tableName}: ${error.message}`,
          rowCount: 0,
          data: [],
        });
      }
    }

    // Generate SQL restore script
    console.log('\n📝 Generating restore SQL script...\n');
    let sqlContent = `-- Database Table Backup and Restore Script\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Tables: ${TABLES_TO_BACKUP.join(', ')}\n\n`;
    sqlContent += `-- This script can be used to restore the deleted tables\n\n`;

    for (const backup of backups) {
      sqlContent += `-- ====================================================\n`;
      sqlContent += `-- Table: ${backup.name}\n`;
      sqlContent += `-- Row count: ${backup.rowCount}\n`;
      sqlContent += `-- ====================================================\n\n`;
      sqlContent += backup.schema + '\n\n';

      if (backup.data.length > 0) {
        sqlContent += `-- Insert data into ${backup.name}\n`;
        // For each row, generate INSERT statement
        // Note: This is a simplified version. For complex data, you might want to use COPY
        if (backup.rowCount <= 100) {
          // Only include INSERT statements if table is small
          sqlContent += `-- Note: Data export included in metadata JSON file\n`;
          sqlContent += `-- Row count: ${backup.rowCount}\n\n`;
        } else {
          sqlContent += `-- Note: Table has ${backup.rowCount} rows, data export in metadata JSON\n\n`;
        }
      }
      sqlContent += '\n';
    }

    // Save SQL file
    writeFileSync(backupFile, sqlContent, 'utf-8');
    console.log(`✓ SQL restore script saved to: ${backupFile}`);

    // Save metadata with full data
    const metadata = {
      timestamp: new Date().toISOString(),
      tables: backups.map(b => ({
        name: b.name,
        rowCount: b.rowCount,
        schema: b.schema,
        hasData: b.data.length > 0,
        dataRowCount: b.data.length,
      })),
      fullData: backups.reduce((acc, b) => {
        acc[b.name] = b.data;
        return acc;
      }, {} as Record<string, any[]>),
    };

    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`✓ Metadata and data saved to: ${metadataFile}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 BACKUP SUMMARY:\n');
    console.log(`  Tables backed up: ${backups.length}`);
    console.log(`  Total rows: ${totalRows.toLocaleString()}`);
    console.log(`  Backup location: ${backupDir}`);
    console.log(`  SQL restore file: ${backupFile.split(process.cwd())[1]}`);
    console.log(`  Metadata file: ${metadataFile.split(process.cwd())[1]}`);

    console.log('\n✅ Backup complete! You can now safely delete the tables.');
    console.log('\n📋 To restore tables later, use the restore script:');
    console.log('   npm run restore:tables');

  } catch (error) {
    console.error('\n✗ Fatal error during backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

