import { ApiPagedResponse, WhaleApiClient, WhaleRpcClient } from '@defichain/whale-api-client'
import { BigNumber } from 'bignumber.js'
import { DfTx, OP_DEFI_TX, toOPCodes } from '@defichain/jellyfish-transaction'
import { SmartBuffer } from 'smart-buffer'
import { Block, Transaction, Vout, Vin } from '@defichain/jellyfish-api-core/dist/category/blockchain'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { get } from 'https'
import db, {sql, defichain_blocks, defichain_transactions, defichain_rewards, defichain_tokens, defichain_vins_vouts, defichain_account_transactions, defichain_account_transactions_amounts} from '../config/database';
import { DefichainBlocks_InsertParameters, DefichainTransactions_InsertParameters, DefichainTokens, DefichainRewards, DefichainRewards_InsertParameters, DefichainVinsVouts_InsertParameters } from './__generated__/index'
// import { createTableBlocks, createTableTransactions, createTableTokens, createTableRewards, createTableAccountTransactions, createTableAccountTransactionsAmounts, createTableVinsVouts, createIndexTokenId, createIndexBlockHeight, createIndexRewardsOwner, createIndexAccountTransactionsOwner, createIndexAccountVinsVoutsOwner } from './sql/createTables'
import { dropTables } from './sql/dropTables'
import { token } from '@defichain/jellyfish-api-core'
import { AccountHistory } from '@defichain/jellyfish-api-core/dist/category/account'
import { createIndexes, createTables } from './sql/createTables'

var fs = require('fs');

/**
 * Initialize WhaleApiClient connected to ocean.defichain.com/v0
 */
const api = new WhaleApiClient({
  url: 'https://ocean.defichain.com',
  network: 'mainnet',
  version: 'v0',
  timeout: 60000
})

const rpc = new WhaleRpcClient('http://driese:-S8Dp8h8TMvpEcuztzUSQZ7u5TlkvFMgP8_g-Qam5Co=@localhost:8554/', {"timeout": 180000})

function sleep(milliseconds:number) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function getTokens() {
  let tokensResponse = await api.tokens.list(200)
  let saveTokensResult = await saveTokens(tokensResponse)
  while (tokensResponse.hasNext) {
    console.log("Waiting 100ms and getting new tokens from API.")
    sleep(100)
    tokensResponse = await api.tokens.list(200, tokensResponse.nextToken)
    let saveTokensResult = await saveTokens(tokensResponse)
  };
  return console.log("All done!")
}
// dropTables
// dropTables();
// createTables();
// createIndexes();

async function getTransaction(txid:string) {
  const transaction = await api.transactions.get(txid)
  console.log("Transaction: ", transaction);
  return transaction;
}

async function getLastSavedBlock() {
  const res = await db.query(sql`SELECT * FROM public.defichain_blocks ORDER BY height DESC LIMIT 1;`)
  return res[0]?.height ?? -1
}

async function getLastSavedRewardHeight() {
  const res = await db.query(sql`SELECT * FROM public.defichain_rewards ORDER BY block_height DESC LIMIT 1;`)
  return res[0]?.block_height ?? 4
}

async function getLastSavedAccountRecordHeight() {
  const res = await db.query(sql`SELECT * FROM public.defichain_account_transactions ORDER BY block_height DESC LIMIT 1;`)
  return res[0]?.block_height ?? 4
}

async function getTokensFromDB() {
  const res : any[] = await db.query(sql`select symbol, tokenid from defichain_tokens;`)
  return res
}

async function saveTokens(tokensResponse:ApiPagedResponse<TokenData>) {
  var save_tokens : any[] = []
  for (let i = 0; i < tokensResponse.length; i++) {
    let tokenAID: any = null // set to null
    let tokenBID: any = null // set to null
    if (tokensResponse[i].isDAT == true) {
      if (tokensResponse[i].isLPS == true) {
        const poolPairResult = await api.poolpairs.get(tokensResponse[i].id);
        tokenAID = parseInt(poolPairResult.tokenA.id)
        tokenBID = parseInt(poolPairResult.tokenB.id)
      }
      const token_to_db: DefichainTokens = {
        tokenid: parseInt(tokensResponse[i].id),
        created_at: new Date(),
        isdat: tokensResponse[i].isDAT,
        isloantoken: tokensResponse[i].isLoanToken,
        islps: tokensResponse[i].isLPS,
        minted: parseFloat(tokensResponse[i].minted),
        name: tokensResponse[i].name,
        symbol: tokensResponse[i].symbol,
        tokenaid: tokenAID,
        tokenbid: tokenBID        
      }
      save_tokens.push(token_to_db)
    }
  }
  
  try {
    console.log("Saving all tokens.")
    if (save_tokens.length > 0) {
      try {
        await defichain_tokens(db).insertOrUpdate(['tokenid'], ...save_tokens)
        console.log("Saved ", save_tokens.length, " tokens to database.")
      }
      catch (e) {
        console.log(e)
      }
    }
    return null;
  }
  catch (e) {
    console.log(e)
  }
}


function getDfTx (vouts: Vout[]): DfTx<any> | undefined {
  const hex = vouts[0].scriptPubKey.hex
  const buffer = SmartBuffer.fromBuffer(Buffer.from(hex, 'hex'))
  const stack = toOPCodes(buffer)
  if (stack.length !== 2 || stack[1].type !== 'OP_DEFI_TX') {
    return undefined
  }
  return (stack[1] as OP_DEFI_TX).tx
}

async function getTransactionsFromBlock(height:number, hash:string) {
  const blockWithTransactions: Block<Transaction>  = await rpc.call('getblock', [hash, 2], 'number')
  
  
  const block_to_db: DefichainBlocks_InsertParameters = {
    height: blockWithTransactions.height,
    created_at: new Date(blockWithTransactions.time * 1000),
    hash: blockWithTransactions.hash,
    transaction_count: blockWithTransactions.nTx,
    difficulty: blockWithTransactions.difficulty,
    masternode: blockWithTransactions.masternode,
    minter: blockWithTransactions.minter,
    minter_block_count: blockWithTransactions.mintedBlocks,
    reward: Number(blockWithTransactions.tx[0].vout[0].value)
  }
  let transactions : any[] = []
  let vouts : any[] = []
  for (let i = 0; i < blockWithTransactions["tx"].length; i++) {
               
    const transaction_to_db : DefichainTransactions_InsertParameters = {
      transaction_id: blockWithTransactions["tx"][i].txid,
      tx_order: i,
      vin_count: blockWithTransactions["tx"][i].vin.length,
      vout_count: blockWithTransactions["tx"][i].vout.length,
      total_vout_value: blockWithTransactions["tx"][i].vout.reduce((prev, curr) => prev + Number(curr.value), 0),
      block_height: height  
    }

    transactions.push(transaction_to_db)
    
    for (var k = 0; k < blockWithTransactions["tx"][i].vout.length; k++) {
      if (blockWithTransactions["tx"][i].vout[k].scriptPubKey.addresses != undefined) {
        const vout_to_db : DefichainVinsVouts_InsertParameters = {
          transaction_id: blockWithTransactions["tx"][i].txid,
          owner: blockWithTransactions["tx"][i].vout[k].scriptPubKey.addresses[0],
          token_amount: Number(blockWithTransactions["tx"][i].vout[k].value),
          tokenid: blockWithTransactions["tx"][i].vout[k]?.tokenId ?? 0
        }
        vouts.push(vout_to_db)
      }      
    }
  }  
  return {block_to_db, transactions, vouts};
}

function getTokenIdBySymbol(data:any, symbol:string) {
  return data.filter(
      function(data:any){ return data.symbol == symbol }
  );
}

async function getAccountHistory() {
  let lastSavedRewardBlockHeight : number = await getLastSavedRewardHeight();
  const tokens : any[] = await getTokensFromDB();
  const blockCount: number = await rpc.call('getblockcount', [], 'number')
  const blockHeight : number = lastSavedRewardBlockHeight > 470000 ? lastSavedRewardBlockHeight : 469999
  let depth : number = 250
  const limit : number = 1000000
  const treshold : number = 820000
  for (let i = blockHeight + depth - 9; i < blockCount + 1; i += (depth - 10)) {
    console.log('Making RPC call! \n Getting blocks up to ' + (i-1) + ' with depth ', depth);
    const accountHistoryResponse : any[] = await rpc.call('listaccounthistory', ['all', {"maxBlockHeight": i, "depth": depth, "no_rewards": false, "limit":limit}], 'number')
    console.log('Number of records retrieved: ', accountHistoryResponse.length)
    console.log("Last block height: ", accountHistoryResponse[0].blockHeight)
    console.log("First block height: ", accountHistoryResponse[accountHistoryResponse.length - 1].blockHeight)

    lastSavedRewardBlockHeight = await getLastSavedRewardHeight();
    let lastSavedAccountRecordBlockHeight = await getLastSavedAccountRecordHeight();
    console.log("Last saved reward block height: ", lastSavedRewardBlockHeight);
    console.log("Last saved account record block height: ", lastSavedAccountRecordBlockHeight);

    var reward_block_height_arr : any[] = []
    var reward_owner_arr : any[] = []
    var reward_rewardtype_arr : any[] = []
    var reward_poolid_arr : any[] = []
    var reward_tokenid_arr : any[] = []
    var reward_tokenamount_arr : any[] = []

    var account_block_height_arr : any[] = []
    var account_owner_arr : any[] = []
    var account_type_arr : any[] = []
    var account_txn_arr : any[] = []
    var account_transaction_id_arr : any[] = []

    var account_amount_token_id_arr : any[] = []
    var account_amount_amount_arr : any[] = []

    if (accountHistoryResponse.length == limit) {
      console.log('Maximum number of records exceeded in RPC call, consider decreasing block depth!');
      break;
    }
    if (accountHistoryResponse.length > treshold) {
      console.log("Decreasing depth by 200 blocks to prevent overload.")
      depth -= 50
    }
    let indexSavedAccounts : number = 0;
    let account_index : any[] = [];
    for (let i = 0; i < accountHistoryResponse.length; i++) {
      if (accountHistoryResponse[i].type == 'Rewards' || accountHistoryResponse[i].type == 'Commission') {
        if (accountHistoryResponse[i].blockHeight <= lastSavedRewardBlockHeight) {
          continue;
        }
        else {
          let rewardType : string = accountHistoryResponse[i].type;
          if (accountHistoryResponse[i].type == 'Rewards') {
            rewardType = accountHistoryResponse[i].rewardType;
          }
          let splitAmounts = accountHistoryResponse[i].amounts[0].split('@');
          let tokenID = getTokenIdBySymbol(tokens, splitAmounts[1])[0]["tokenid"]
          
          reward_block_height_arr.push(accountHistoryResponse[i].blockHeight);
          reward_owner_arr.push(accountHistoryResponse[i].owner)
          reward_rewardtype_arr.push(rewardType)
          reward_poolid_arr.push(parseInt(accountHistoryResponse[i].poolID))
          reward_tokenid_arr.push(tokenID)
          reward_tokenamount_arr.push(parseFloat(splitAmounts[0]))
          // const reward_to_db: DefichainRewards_InsertParameters = {
          //   block_height: accountHistoryResponse[i].blockHeight,
          //   owner: accountHistoryResponse[i].owner,
          //   rewardtype: rewardType,
          //   poolid: parseInt(accountHistoryResponse[i].poolID),
          //   tokenid: tokenID,
          //   tokenamount: parseFloat(splitAmounts[0])
          // }
          // save_rewards.push(reward_to_db)
        }
      }
      else {
        if (accountHistoryResponse[i].blockHeight <= lastSavedAccountRecordBlockHeight) {
          continue;
        }
        else {
          account_block_height_arr.push(accountHistoryResponse[i].blockHeight);
          account_owner_arr.push(accountHistoryResponse[i].owner)
          account_type_arr.push(accountHistoryResponse[i].type)
          account_txn_arr.push(parseInt(accountHistoryResponse[i].txn))
          account_transaction_id_arr.push(accountHistoryResponse[i].txid)
          for (let j=0; j < accountHistoryResponse[i].amounts.length; j++) {
            let splitAmounts = accountHistoryResponse[i].amounts[j].split('@');
            const tokenIdLookup = getTokenIdBySymbol(tokens, splitAmounts[1])[0] == undefined ? undefined : getTokenIdBySymbol(tokens, splitAmounts[1])[0]["tokenid"]
            if (tokenIdLookup != undefined) {
              let tokenID = tokenIdLookup
              account_amount_token_id_arr.push(tokenID)
              account_amount_amount_arr.push(splitAmounts[0])
              // saving index of account records for later use
              account_index.push(indexSavedAccounts);
            }
          }
          // incrementing index by one
          indexSavedAccounts++
        }
      }
      // try {
      //   if (reward_block_height_arr.length > 400000) {
      //     try {
      //       console.log("Saving 400000 rewards records.")
      //       // await defichain_rewards(db).insert(...save_rewards)
      //       await db.query(sql`
      //         INSERT INTO defichain_rewards (block_height, owner, rewardtype, poolid, tokenid, tokenamount)
      //         SELECT * FROM UNNEST(${reward_block_height_arr}::INTEGER[], ${reward_owner_arr}::VARCHAR[], ${reward_rewardtype_arr}::VARCHAR[], ${reward_poolid_arr}::SMALLINT[], ${reward_tokenid_arr}::SMALLINT[], ${reward_tokenamount_arr}::REAL[])
      //       `);
      //       console.log("Saved ", reward_block_height_arr.length, " rewards to database. \nFrom height ", reward_block_height_arr[reward_block_height_arr.length - 1], " to ", reward_block_height_arr[0])
      //       reward_block_height_arr = []
      //       reward_owner_arr = []
      //       reward_rewardtype_arr = []
      //       reward_poolid_arr = []
      //       reward_tokenid_arr = []
      //       reward_tokenamount_arr = []
      //     }
      //     catch (e) {
      //       console.log(e)
      //       return null;
      //     }
      //     if (account_block_height_arr.length > 400000) {
      //       try {
      //         console.log("Saving 400000 account records.")
      //         var accountTransactions : any[] = await db.query(sql`
      //           INSERT INTO defichain_account_transactions (block_height, owner, type, txn, transaction_id)
      //           SELECT * FROM UNNEST(${account_block_height_arr}::INTEGER[], ${account_owner_arr}::VARCHAR[], ${ account_type_arr}::VARCHAR[], ${ account_txn_arr}::SMALLINT[], ${ account_transaction_id_arr}::VARCHAR[]) RETURNING id;
      //         `);
      //         console.log("Saved ", account_block_height_arr.length, " account records to database. \nFrom height ", account_block_height_arr[account_block_height_arr.length - 1], " to ", account_block_height_arr[0])
      //         account_block_height_arr = []
      //         account_owner_arr = []
      //         account_type_arr = []
      //         account_txn_arr = []
      //         account_transaction_id_arr = []
      //       }
      //       catch (e) {
      //         console.log(e)
      //         return null;
      //       }
      //     }
      //     if (account_amount_token_id_arr.length > 400000) {
      //       try {
      //         console.log("Saving 400000 account amount records.")
      //         // mapping saved account records to account amount rows
      //         let account_amount_transaction_id_arr : any[] = account_index.map(i => accountTransactions[i]["id"]);
      //         await db.query(sql`
      //           INSERT INTO defichain_account_transactions_amounts (transaction_id, tokenid, token_amount)
      //           SELECT * FROM UNNEST(${account_amount_transaction_id_arr}::INTEGER[], ${account_amount_token_id_arr}::SMALLINT[], ${account_amount_amount_arr}::REAL[])
      //         `);
      //         account_amount_token_id_arr = []
      //         account_amount_amount_arr = []
      //         account_index = []
      //       }
      //       catch (e) {
      //         console.log(e)
      //         return null;
      //       }
      //     }          
      //   }
      // }
      // catch (e) {
      //   console.log(e)
      //   return null;
      // }
    }
    try {
      console.log("Saving rewards.")
      
      try {
        await db.tx(async (db) => {
          await db.query(sql`
            INSERT INTO defichain_rewards (block_height, owner, rewardtype, poolid, tokenid, tokenamount)
            SELECT * FROM UNNEST(${reward_block_height_arr}::INTEGER[], ${reward_owner_arr}::VARCHAR[], ${reward_rewardtype_arr}::VARCHAR[], ${reward_poolid_arr}::SMALLINT[], ${reward_tokenid_arr}::SMALLINT[], ${reward_tokenamount_arr}::REAL[])
          `);
          console.log("Saved ", reward_block_height_arr.length, " rewards to database. \nFrom height ", reward_block_height_arr[reward_block_height_arr.length - 1], " to ", reward_block_height_arr[0])
          reward_block_height_arr = []
          reward_owner_arr = []
          reward_rewardtype_arr = []
          reward_poolid_arr = []
          reward_tokenid_arr = []
          reward_tokenamount_arr = []
        
          var accountTransactions : any[] = await db.query(sql`
            INSERT INTO defichain_account_transactions (block_height, owner, type, txn, transaction_id)
            SELECT * FROM UNNEST(${account_block_height_arr}::INTEGER[], ${account_owner_arr}::VARCHAR[], ${ account_type_arr}::VARCHAR[], ${ account_txn_arr}::SMALLINT[], ${ account_transaction_id_arr}::VARCHAR[]) RETURNING id;
          `);
          console.log("Saved ", account_block_height_arr.length, " account records to database. \nFrom height ", account_block_height_arr[account_block_height_arr.length - 1], " to ", account_block_height_arr[0])
          account_block_height_arr = []
          account_owner_arr = []
          account_type_arr = []
          account_txn_arr = []
          account_transaction_id_arr = []
        
          // mapping saved account records to account amount rows
          let account_amount_transaction_id_arr : any[] = account_index.map(i => accountTransactions[i]["id"]);
          await db.query(sql`
            INSERT INTO defichain_account_transactions_amounts (transaction_id, tokenid, token_amount)
            SELECT * FROM UNNEST(${account_amount_transaction_id_arr}::INTEGER[], ${account_amount_token_id_arr}::SMALLINT[], ${account_amount_amount_arr}::REAL[])
          `);
          account_amount_token_id_arr = []
          account_amount_amount_arr = []
          account_index = []
        });
        
      }
      catch (e) {
        console.log(e)
        return null;
      }
      
    }
    catch (e) {
      console.log(e)
      return null;
    }
  }
  // console.log('Making a call!')
  // await rpc.call('listaccounthistory', ['all', {"maxBlockHeight": 470000, "no_rewards": false, "limit": 200000}], 'number').then((result:any) => {
    
  //   console.log(result.length)
  //   // // convert JSON object to string
  //   // const data = JSON.stringify(result, null, 2);
  //   // // console.log(Object.keys(result).length)
  //   // fs.writeFile("reward_data.test.json", data, function(err:any) {
  //   //     if (err) {
  //   //         console.log(err);
  //   //     }
  //   // });
  // }).catch((err) => {
  //   console.log(err)
  // }).finally(() => {
  //   console.log('cleanup')
  // })

  return undefined
}

async function getBlocks(height_from:number, height_to:number) {
  const res = await db.query(sql`SELECT id, hash, height FROM defichain_blocks WHERE (height >= ${height_from} AND height < ${height_to});`)
  // console.log(res.rows[0])
  return res
}

async function getTransactions() {
  // Get the height of the most-work fully-validated chain.
  const blockCount: number = await rpc.call('getblockcount', [], 'number')
  const lastSavedBlock : number = await getLastSavedBlock();
  console.log(lastSavedBlock)
  var save_blocks : any[] = []
  var save_transactions : any[] = []
  var save_vouts : any[] = []
  for (let i = lastSavedBlock + 1; i < blockCount + 1; i++) {
    console.log('Get a hash of block in best-block-chain at height: ', i)
    const blockHash: string = await rpc.call('getblockhash', [i], 'number')
    let blockTransactions = await getTransactionsFromBlock(i, blockHash)

    save_blocks.push(blockTransactions.block_to_db)
    save_transactions.push(...blockTransactions.transactions)
    save_vouts.push(...blockTransactions.vouts)
    
    
    if (i%5000 == 0) {
      await db.tx(async (db) => {
        defichain_blocks(db).insertOrIgnore(...save_blocks)
        defichain_transactions(db).insertOrIgnore(...save_transactions)
        defichain_vins_vouts(db).insertOrIgnore(...save_vouts)
        // defichain_blocks(db).bulkInsertOrIgnore({
        //   columnsToInsert: ['height', 'created_at', 'hash', 'transaction_count', 
        //                     'difficulty', 'masternode', 'minter', 'minter_block_count', 'reward'],
        //   records: save_blocks,
        // });
        // defichain_transactions(db).bulkInsertOrIgnore({
        //   columnsToInsert: ['transaction_id', 'tx_order', 'vin_count',
        //   'vout_count', 'total_vout_value', 'block_height'],
        //   records: save_transactions,
        // });
        // defichain_vins_vouts(db).bulkInsertOrIgnore({
        //   columnsToInsert: ['transaction_id', 'owner', 'token_amount', 'tokenid'],
        //   records: save_vouts,
        // });
      });
      save_blocks = []
      save_transactions = []
      save_vouts = []
      sleep(20)
    }
    // if (i == 50000) {
    //   break;
    // }
  }
  if (save_blocks.length > 0) {
    await db.tx(async (db) => {
      defichain_blocks(db).insertOrIgnore(...save_blocks)
      defichain_transactions(db).insertOrIgnore(...save_transactions)
      defichain_vins_vouts(db).insertOrIgnore(...save_vouts)
      // defichain_blocks(db).bulkInsertOrIgnore({
      //   columnsToInsert: ['height', 'created_at', 'hash', 'transaction_count', 
      //                     'difficulty', 'masternode', 'minter', 'minter_block_count', 'reward'],
      //   records: save_blocks,
      // });
      // defichain_transactions(db).bulkInsertOrIgnore({
      //   columnsToInsert: ['transaction_id', 'tx_order', 'vin_count',
      //   'vout_count', 'total_vout_value', 'block_height'],
      //   records: save_transactions,
      // });
      // defichain_vins_vouts(db).bulkInsertOrIgnore({
      //   columnsToInsert: ['transaction_id', 'owner', 'token_amount', 'tokenid'],
      //   records: save_vouts,
      // });
    });
  }
  
}

try {
  
  

  getAccountHistory();
  // getTokens();


  
  // getTransactions();
  
  
  process.once('SIGTERM', () => {
    db.dispose().catch((ex) => {
      console.error(ex);
    });
  });
}
catch (e) {
  console.log(e)
}