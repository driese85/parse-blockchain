import db, {sql} from '../../config/database';

export async function createTables() {
  const creates = await db.tx(async (db) => {
    const createA = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_tokens (tokenID SMALLINT PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE, symbol VARCHAR, name VARCHAR, isDAT BOOLEAN, isLPS BOOLEAN, isLoanToken BOOLEAN, minted REAL, tokenAID SMALLINT, tokenBID SMALLINT);`)
    const createB = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_blocks (height INTEGER PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE, hash VARCHAR, transaction_count SMALLINT, difficulty REAL, masternode VARCHAR, minter VARCHAR, minter_block_count INTEGER, reward REAL);`)
    const createC = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_transactions (transaction_id VARCHAR PRIMARY KEY, tx_order SMALLINT, vin_count SMALLINT, vout_count SMALLINT, total_vout_value REAL, block_height INTEGER REFERENCES defichain_blocks(height));`)
    const createD = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_vins_vouts (id INTEGER UNIQUE GENERATED ALWAYS AS IDENTITY, transaction_id VARCHAR REFERENCES defichain_transactions(transaction_id), owner VARCHAR, tokenid SMALLINT REFERENCES defichain_tokens(tokenID), token_amount REAL);`)
    const createE = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_account_transactions (id INTEGER UNIQUE GENERATED ALWAYS AS IDENTITY, block_height INTEGER REFERENCES defichain_blocks(height), owner VARCHAR, type VARCHAR, txn SMALLINT, transaction_id VARCHAR REFERENCES defichain_transactions(transaction_id));`)
    const createF = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_account_transactions_amounts (id INTEGER UNIQUE GENERATED ALWAYS AS IDENTITY, transaction_id INTEGER REFERENCES defichain_account_transactions(id), tokenid SMALLINT REFERENCES defichain_tokens(tokenID), token_amount REAL);`)
    const createG = db.query(sql`CREATE TABLE IF NOT EXISTS defichain_rewards (id INTEGER UNIQUE GENERATED ALWAYS AS IDENTITY, block_height INTEGER REFERENCES defichain_blocks(height), owner VARCHAR, rewardType VARCHAR, poolID SMALLINT REFERENCES defichain_tokens(tokenID), tokenID SMALLINT REFERENCES defichain_tokens(tokenID), tokenAmount REAL);`)

    return undefined;
  });
  return creates;
};

export async function createIndexes() {
  const indexes = await db.tx(async (db) => {
    const indexA = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_tokens_tokenid ON defichain_tokens(tokenid);`)
    const indexB = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_rewards_owner ON defichain_rewards(owner);`)
    const indexC = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_account_transactions_owner ON defichain_account_transactions(owner);`)
    const indexD = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_vins_vouts_owner ON defichain_vins_vouts(owner);`)
    const indexE = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_transactions_block_height ON defichain_transactions(block_height);`)
    const indexF = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_vins_vouts_transaction_id ON defichain_vins_vouts(transaction_id);`)
    const indexG = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_vins_vouts_token_id ON defichain_vins_vouts(tokenid);`)
    const indexH = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_account_transactions_block_height ON defichain_account_transactions(block_height);`)
    const indexI = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_account_transactions_transaction_id ON defichain_account_transactions(transaction_id);`)
    const indexJ = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_account_transactions_amounts_transaction_id ON defichain_account_transactions_amounts(transaction_id);`)
    const indexK = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_account_transactions_amounts_tokenid ON defichain_account_transactions_amounts(tokenid);`)
    const indexL = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_rewards_block_height ON defichain_rewards(block_height);`)
    const indexM = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_rewards_poolID ON defichain_rewards(poolID);`)
    const indexN = db.query(sql`CREATE INDEX IF NOT EXISTS idx_defichain_rewards_tokenID ON defichain_rewards(tokenID);`)


    return undefined;
  });
  return indexes;
};