import db, {sql} from '../../config/database';

export async function dropTables() {
  const drops = await db.tx(async (db) => {
    const dropA = db.query(sql`
      DROP TABLE IF EXISTS defichain_account_transactions_amounts;
    `);
    const dropB = db.query(sql`
      DROP TABLE IF EXISTS defichain_account_transactions;
    `);
    const dropC = db.query(sql`
      DROP TABLE IF EXISTS defichain_rewards;
    `);
    const dropD = db.query(sql`
      DROP TABLE IF EXISTS defichain_vins_vouts;
    `);
    const dropE = db.query(sql`
      DROP TABLE IF EXISTS defichain_transactions;
    `);
    const dropF = db.query(sql`
      DROP TABLE IF EXISTS defichain_blocks;
    `);
    const dropG = db.query(sql`
      DROP TABLE IF EXISTS defichain_tokens;
    `);
    return undefined;
  });
  return drops;

};