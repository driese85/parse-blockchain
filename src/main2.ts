import { WIF } from '@defichain/jellyfish-crypto'
import { WalletClassic } from '@defichain/jellyfish-wallet-classic'
import { ApiPagedResponse, blocks, WhaleApiClient, WhaleRpcClient } from '@defichain/whale-api-client'
import { Transaction, TransactionVin, TransactionVout } from '@defichain/whale-api-client/dist/api/transactions'
import { MainNet } from '@defichain/jellyfish-network'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { BigNumber } from 'bignumber.js'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairs } from '@defichain/whale-api-client/dist/api/poolpairs'
import { AccountToUtxos, CAccountToUtxos, DfTx, OP_DEFI_TX, toOPCodes } from '@defichain/jellyfish-transaction'
import { SmartBuffer } from 'smart-buffer'
import { fromScript, fromScriptHex } from '@defichain/jellyfish-address'
import { Block } from '@defichain/whale-api-client/dist/api/blocks'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { get } from 'https'
import db, {sql, defichain_blocks, defichain_transactions, defichain_rewards, defichain_tokens, defichain_vins_vouts, defichain_account_transactions, defichain_account_transactions_amounts} from '../config/database';
import { DefichainBlocks_InsertParameters, DefichainTransactions_InsertParameters, DefichainTokens, DefichainRewards, DefichainVinsVouts_InsertParameters } from './__generated__/index'
import { table } from 'console'
import { token } from '@defichain/jellyfish-api-core'
import { AccountHistory } from '@defichain/jellyfish-api-core/dist/category/account'

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

const rpc = new WhaleRpcClient('http://driese:-S8Dp8h8TMvpEcuztzUSQZ7u5TlkvFMgP8_g-Qam5Co=@localhost:8554/', {"timeout": 600000})

function sleep(milliseconds:number) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function getTransactionFee (transaction: Transaction, vins: TransactionVin[], dftx?: DfTx<any>): BigNumber {
  if (dftx === undefined || dftx.type !== CAccountToUtxos.OP_CODE) {
    return new BigNumber(getTotalVinsValue(vins).minus(transaction.totalVoutValue))
  }

  // AccountToUtxos
  const accountToUtxos = dftx as DfTx<AccountToUtxos>
  const sumOfInputs = getTotalVinsValue(vins)
  const sumOfAccountInputs = accountToUtxos.data.balances.map(balance => balance.amount).reduce((a, b) => a.plus(b))
  return new BigNumber(sumOfInputs.plus(sumOfAccountInputs).minus(transaction.totalVoutValue))
}

function getTotalVinsValue (vins: TransactionVin[]): BigNumber {
  let value: BigNumber = new BigNumber(0)
  vins.forEach(vin => {
    if (vin.vout !== undefined) {
      value = new BigNumber(vin.vout.value).plus(value)
    }
  })
  return value
}

try {
  
  async function testApiCoreClient() {
    // const height = await findBlock();
    // const tokens = await getTokensFromDB();
    // for (let i = 4; i < height.height; i += 5) {
    //   console.log('Getting blocks up to ' + i + ' with depth 5.')
    //   const accountHistoryResponse : any[] = await rpc.call('listaccounthistory', ['all', {"maxBlockHeight": i, "depth": 5, "txtype": "0", "no_rewards": false, "limit":20000000}], 'number')
    //   var save_rewards : any[] = []
    //   for (let i = 0; i < accountHistoryResponse.length; i++) {
    //     if (accountHistoryResponse[i].blockHeight < (height.height + 1) && (accountHistoryResponse[i].type == 'Rewards' || accountHistoryResponse[i].type == 'Commission')) {
    //       let rewardType : string = accountHistoryResponse[i].type;
    //       if (accountHistoryResponse[i].type == 'Rewards') {
    //         rewardType = accountHistoryResponse[i].rewardType;
    //       }
    //       let splitAmounts = accountHistoryResponse[i].amounts[0].split('@');
    //       let tokenID = getTokenIdBySymbol(tokens, splitAmounts[1])[0]["tokenid"]
    //       const reward_to_db: DefichainRewards = {
    //         block_height: accountHistoryResponse[i].blockHeight,
    //         owner: accountHistoryResponse[i].owner,
    //         rewardtype: rewardType,
    //         poolid: parseInt(accountHistoryResponse[i].poolID),
    //         tokenid: tokenID,
    //         tokenamount: parseFloat(splitAmounts[0])
    //       }
    //       save_rewards.push(reward_to_db)
    //     }
    //     try {
    //       if (save_rewards.length > 1999) {
    //         try {
    //           console.log("Saving 2000 rewards records.")
    //           await defichain_rewards(db).insert(...save_rewards)
    //           save_rewards = [];
    //           console.log("Saved ", save_rewards.length, " rewards to database. \nLast entry height = ", save_rewards[save_rewards.length - 1].block_height)
    //         }
    //         catch (e) {
    //           console.log(e)
    //           return null;
    //         }
    //       }
    //     }
    //     catch (e) {
    //       console.log(e)
    //       return null;
    //     }
    //   }
    //   try {
    //     console.log("Saving remaining rewards.")
    //     if (save_rewards.length > 0) {
    //       try {
    //         await defichain_rewards(db).insert(...save_rewards)
    //         console.log("Saved ", save_rewards.length, " rewards to database. \nLast entry height = ", save_rewards[save_rewards.length - 1].block_height)
    //       }
    //       catch (e) {
    //         console.log(e)
    //         return null;
    //       }
    //     }
    //   }
    //   catch (e) {
    //     console.log(e)
    //     return null;
    //   }
    // }
    console.log('Making a call!')
    await rpc.call('listaccounthistory', ['all', {"maxBlockHeight": 1530000, "depth": 4000, "no_rewards": true, "limit": 200000}], 'number').then((result:any) => {
      console.log(result.length)
      // convert JSON object to string
      const data = JSON.stringify(result, null, 2);
      // console.log(Object.keys(result).length)
      fs.writeFile("reward_data.test.json", data, function(err:any) {
        if (err) {
            console.log(err);
        }
      });
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      console.log('cleanup')
    })

    // await rpc.call('getblock', ['0e011715fa854d4e0a725e6e82cf2bf79843e99965ab5d80c71e6d7691228a9d', 2], 'number').then((result:any) => {
      
    //   // convert JSON object to string
    //   const data = JSON.stringify(result);
    //   // console.log(Object.keys(result).length)
    //   var fs = require('fs');
    //   fs.writeFile("block_data.txt", data, function(err:any) {
    //       if (err) {
    //           console.log(err);
    //       }
    //   });
    // }).catch((err) => {
    //   console.log(err)
    // }).finally(() => {
    //   console.log('cleanup')
    // })
  }

  testApiCoreClient()
  
}
catch (e) {
  console.log(e)
}