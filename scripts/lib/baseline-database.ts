import type { Payload } from "payload";
import snapshot from "../../src/migrations/20261108_091832_baseline.json";

const baselineName = "20261108_091832_baseline";

// Preserve old local-auth columns and sessions; production SSO does not use them.
export async function baselineDatabase(payload: Payload, apply: boolean) {
  const client = await payload.db.pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    await client.query("LOCK TABLE payload_migrations IN EXCLUSIVE MODE");
    const { rows: history } = await client.query("SELECT name, batch FROM payload_migrations");
    if (history.some((row) => row.name === baselineName)) {
      await client.query("ROLLBACK");
      return "Baseline already recorded; no changes.";
    }
    if (history.some((row) => Number(row.batch) !== -1 || row.name !== "dev")) {
      throw new Error("Unexpected migration history; review before adopting the baseline.");
    }
    const { rows: columns } = await client.query(`
      SELECT c.relname AS table_name, a.attname AS name,
        format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull AS not_null,
        pg_get_expr(d.adbin, d.adrelid) AS default_value
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
      LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `);
    const { rows: enums } = await client.query(`
      SELECT t.typname AS name, array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS labels
      FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON e.enumtypid = t.oid WHERE n.nspname = 'public' GROUP BY t.typname
    `);
    const { rows: indexes } = await client.query(`
      SELECT c.relname AS name, i.indisunique AS is_unique, i.indisvalid AS is_valid,
        am.amname AS method, pg_get_expr(i.indpred, i.indrelid) AS predicate,
        ARRAY(SELECT pg_get_indexdef(i.indexrelid, k, true)
              FROM generate_series(1, i.indnatts) k ORDER BY k) AS columns
      FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_am am ON am.oid = c.relam WHERE n.nspname = 'public'
    `);
    const { rows: constraints } = await client.query(`
      SELECT c.conname AS name, t.relname AS table_name, pg_get_constraintdef(c.oid) AS definition
      FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'public'
    `);
    const columnMap = new Map(columns.map((column) => [`${column.table_name}.${column.name}`, column]));
    const enumMap = new Map(enums.map((entry) => [entry.name, entry.labels]));
    const indexMap = new Map(indexes.map((index) => [index.name, index]));
    const constraintMap = new Map(constraints.map((constraint) => [`${constraint.table_name}.${constraint.name}`, constraint.definition]));
    const normalize = (value: string) => value.replaceAll('"', '').replaceAll('public.', '');
    const differences: string[] = [];
    const expectedTables = new Set(Object.values(snapshot.tables).map((table) => table.name));
    for (const table of new Set(columns.map((column) => column.table_name))) {
      if (!expectedTables.has(table) && table !== "users_sessions") differences.push(`Unexpected table: ${table}`);
    }
    for (const table of Object.values(snapshot.tables)) {
      for (const column of Object.values(table.columns)) {
        const key = `${table.name}.${column.name}`;
        const actual = columnMap.get(key);
        const type = column.type === 'serial' ? 'integer' : column.type.replace('varchar', 'character varying');
        if (!actual || normalize(actual.type) !== type || actual.not_null !== column.notNull) differences.push(key);
        if (column.type === 'serial' && !actual?.default_value?.startsWith('nextval(')) differences.push(`${key} sequence`);
        if (column.type !== 'serial' && (actual?.default_value?.replace(/::[a-z_ ]+$/i, '') ?? null) !== ('default' in column ? String(column.default) : null)) differences.push(`${key} default`);
        if (column.primaryKey && constraintMap.get(`${table.name}.${table.name}_pkey`) !== `PRIMARY KEY (${column.name})`) differences.push(`${key} primary key`);
      }
      for (const index of Object.values(table.indexes)) {
        const actual = indexMap.get(index.name);
        if (!actual?.is_valid || actual.is_unique !== index.isUnique || actual.method !== index.method || actual.predicate ||
          JSON.stringify(actual.columns.map(normalize)) !== JSON.stringify(index.columns.map((column) => column.expression))) differences.push(index.name);
      }
      for (const foreignKey of Object.values(table.foreignKeys)) {
        const expected = `FOREIGN KEY (${foreignKey.columnsFrom.join(', ')}) REFERENCES ${foreignKey.tableTo}(${foreignKey.columnsTo.join(', ')})` +
          (foreignKey.onDelete === 'no action' ? '' : ` ON DELETE ${foreignKey.onDelete.toUpperCase()}`);
        if (normalize(constraintMap.get(`${table.name}.${foreignKey.name}`) ?? '') !== expected) differences.push(foreignKey.name);
      }
    }
    for (const expected of Object.values(snapshot.enums)) {
      if (JSON.stringify(enumMap.get(expected.name)) !== JSON.stringify(expected.values)) differences.push(expected.name);
    }
    if (differences.length) throw new Error(`Schema differs from the baseline: ${differences.join(', ')}`);
    if (apply) {
      await client.query("DELETE FROM payload_migrations WHERE name = 'dev' AND batch = -1");
      await client.query("INSERT INTO payload_migrations (name, batch) VALUES ($1, 1)", [baselineName]);
      await client.query("COMMIT");
    } else {
      await client.query("ROLLBACK");
    }
    return apply ? "Baseline verified and recorded; application data unchanged." : "Baseline matches; no data changed.";
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
