import createConnectionPool, {sql} from '@databases/pg';
import tables from '@databases/pg-typed';
import DatabaseSchema from '../src/__generated__';
import config from '../src/config'

export {sql};

const db = createConnectionPool(config.DATABASE_URL);
export default db;

const {defichain_blocks, defichain_transactions, defichain_tokens, defichain_rewards, defichain_vins_vouts, defichain_account_transactions, defichain_account_transactions_amounts} = tables<DatabaseSchema>({
  databaseSchema: require('../src/__generated__/schema.json'),
});

export {defichain_blocks, defichain_transactions, defichain_tokens, defichain_rewards, defichain_vins_vouts, defichain_account_transactions, defichain_account_transactions_amounts};