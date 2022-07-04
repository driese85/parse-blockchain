import { Script } from "vm";

OP_DEFI_TX_POOL_SWAP: (poolSwap) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_pool_1.CPoolSwap.OP_CODE,
        name: dftx_pool_1.CPoolSwap.OP_NAME,
        data: poolSwap
    });
},
OP_DEFI_TX_COMPOSITE_SWAP: (compositeSwap) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_pool_1.CCompositeSwap.OP_CODE,
        name: dftx_pool_1.CCompositeSwap.OP_NAME,
        data: compositeSwap
    });
},
OP_DEFI_TX_POOL_ADD_LIQUIDITY: (poolAddLiquidity) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_pool_1.CPoolAddLiquidity.OP_CODE,
        name: dftx_pool_1.CPoolAddLiquidity.OP_NAME,
        data: poolAddLiquidity
    });
},
OP_DEFI_TX_POOL_REMOVE_LIQUIDITY: (poolRemoveLiquidity) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_pool_1.CPoolRemoveLiquidity.OP_CODE,
        name: dftx_pool_1.CPoolRemoveLiquidity.OP_NAME,
        data: poolRemoveLiquidity
    });
},
OP_DEFI_TX_POOL_CREATE_PAIR: (poolCreatePair) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_pool_1.CPoolCreatePair.OP_CODE,
        name: dftx_pool_1.CPoolCreatePair.OP_NAME,
        data: poolCreatePair
    });
},
OP_DEFI_TX_POOL_UPDATE_PAIR: (poolCreatePair) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_pool_1.CPoolUpdatePair.OP_CODE,
        name: dftx_pool_1.CPoolUpdatePair.OP_NAME,
        data: poolCreatePair
    });
},
OP_DEFI_TX_TOKEN_MINT: (tokenMint) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_token_1.CTokenMint.OP_CODE,
        name: dftx_token_1.CTokenMint.OP_NAME,
        data: tokenMint
    });
},
OP_DEFI_TX_TOKEN_CREATE: (tokenCreate) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_token_1.CTokenCreate.OP_CODE,
        name: dftx_token_1.CTokenCreate.OP_NAME,
        data: tokenCreate
    });
},
OP_DEFI_TX_TOKEN_UPDATE: (tokenUpdate) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_token_1.CTokenUpdate.OP_CODE,
        name: dftx_token_1.CTokenUpdate.OP_NAME,
        data: tokenUpdate
    });
},
OP_DEFI_TX_TOKEN_UPDATE_ANY: (tokenUpdateAny) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_token_1.CTokenUpdateAny.OP_CODE,
        name: dftx_token_1.CTokenUpdateAny.OP_NAME,
        data: tokenUpdateAny
    });
},
OP_DEFI_TX_UTXOS_TO_ACCOUNT: (utxosToAccount) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_account_1.CUtxosToAccount.OP_CODE,
        name: dftx_account_1.CUtxosToAccount.OP_NAME,
        data: utxosToAccount =>
            to: ScriptBalances[] // --------------| n = VarUInt{1-9 bytes}, + n bytes
    });
},
OP_DEFI_TX_ACCOUNT_TO_UTXOS: (accountToUtxos) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_account_1.CAccountToUtxos.OP_CODE,
        name: dftx_account_1.CAccountToUtxos.OP_NAME,
        data: accountToUtxos =>
            from: address // -----------------------| n = VarUInt{1-9 bytes}, + n bytes
            balances: token and amount // -----------| c = VarUInt{1-9 bytes}, + c x TokenBalance
            mintingOutputsStart: number // --------| 4 bytes unsigned
    });
},
OP_DEFI_TX_ACCOUNT_TO_ACCOUNT: (accountToAccount) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_account_1.CAccountToAccount.OP_CODE,
        name: dftx_account_1.CAccountToAccount.OP_NAME,
        data: accountToAccount =>
            from: Script // ----------------------| n = VarUInt{1-9 bytes}, + n bytes
            to: ScriptBalances[] // --------------| n = VarUInt{1-9 bytes}, + n bytes
    });
},
OP_DEFI_TX_ANY_ACCOUNT_TO_ACCOUNT: (anyAccountToAccount) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_account_1.CAnyAccountToAccount.OP_CODE,
        name: dftx_account_1.CAnyAccountToAccount.OP_NAME,
        data: anyAccountToAccount =>
            from: ScriptBalances[] // ------------| n = VarUInt{1-9 bytes}, + n bytes
            to: ScriptBalances[] // --------------| n = VarUInt{1-9 bytes}, + n bytes
    });
},
OP_DEFI_TX_FUTURE_SWAP: (futureSwap) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_account_1.CSetFutureSwap.OP_CODE,
        name: dftx_account_1.CSetFutureSwap.OP_NAME,
        data: futureSwap =>
            owner: address // ----------------------| n = VarUInt{1-9 bytes}, + n bytes, Address used to fund contract with
            source: TokenBalanceVarInt // ---------| VarUInt{1-9 bytes} for token Id + 8 bytes for amount, Source amount in amount@token format
            destination: number // ----------------| 4 bytes unsigned, Destination dToken
            withdraw: boolean // ------------------| 1 byte, True if withdraw
    });
},
OP_DEFI_TX_APPOINT_ORACLE: (appointOracle) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_oracles_1.CAppointOracle.OP_CODE,
        name: dftx_oracles_1.CAppointOracle.OP_NAME,
        data: appointOracle
    });
},
OP_DEFI_TX_REMOVE_ORACLE: (removeOracle) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_oracles_1.CRemoveOracle.OP_CODE,
        name: dftx_oracles_1.CRemoveOracle.OP_NAME,
        data: removeOracle
    });
},
OP_DEFI_TX_UPDATE_ORACLE: (updateOracle) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_oracles_1.CUpdateOracle.OP_CODE,
        name: dftx_oracles_1.CUpdateOracle.OP_NAME,
        data: updateOracle
    });
},
OP_DEFI_TX_SET_ORACLE_DATA: (setOracleData) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_oracles_1.CSetOracleData.OP_CODE,
        name: dftx_oracles_1.CSetOracleData.OP_NAME,
        data: setOracleData
    });
},
OP_DEFI_TX_AUTO_AUTH_PREP: () => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_misc_1.CAutoAuthPrep.OP_CODE,
        name: dftx_misc_1.CAutoAuthPrep.OP_NAME,
        data: null
    });
},
OP_DEFI_TX_CREATE_MASTER_NODE: (createMasterNode) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_masternode_1.CCreateMasternode.OP_CODE,
        name: dftx_masternode_1.CCreateMasternode.OP_NAME,
        data: createMasterNode
    });
},
OP_DEFI_TX_RESIGN_MASTER_NODE: (resignMasternode) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_masternode_1.CResignMasternode.OP_CODE,
        name: dftx_masternode_1.CResignMasternode.OP_NAME,
        data: resignMasternode
    });
},
OP_DEFI_TX_SET_GOVERNANCE: (setGovernance) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_governance_1.CSetGovernance.OP_CODE,
        name: dftx_governance_1.CSetGovernance.OP_NAME,
        data: setGovernance
    });
},
OP_DEFI_TX_SET_GOVERNANCE_HEIGHT: (setGovernanceHeight) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_governance_1.CSetGovernanceHeight.OP_CODE,
        name: dftx_governance_1.CSetGovernanceHeight.OP_NAME,
        data: setGovernanceHeight
    });
},
OP_DEFI_TX_ICX_CREATE_ORDER: (createOrder) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXCreateOrder.OP_CODE,
        name: dftx_icxorderbook_1.CICXCreateOrder.OP_NAME,
        data: createOrder
    });
},
OP_DEFI_TX_ICX_MAKE_OFFER: (makeOffer) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXMakeOffer.OP_CODE,
        name: dftx_icxorderbook_1.CICXMakeOffer.OP_NAME,
        data: makeOffer
    });
},
OP_DEFI_TX_ICX_CLOSE_ORDER: (closeOrder) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXCloseOrder.OP_CODE,
        name: dftx_icxorderbook_1.CICXCloseOrder.OP_NAME,
        data: closeOrder
    });
},
OP_DEFI_TX_ICX_CLOSE_OFFER: (closeOffer) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXCloseOffer.OP_CODE,
        name: dftx_icxorderbook_1.CICXCloseOffer.OP_NAME,
        data: closeOffer
    });
},
OP_DEFI_TX_CREATE_CFP: (createCfp) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_governance_1.CCreateCfp.OP_CODE,
        name: dftx_governance_1.CCreateCfp.OP_NAME,
        data: createCfp
    });
},
OP_DEFI_TX_CREATE_VOC: (createVoc) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_governance_1.CCreateVoc.OP_CODE,
        name: dftx_governance_1.CCreateVoc.OP_NAME,
        data: createVoc
    });
},
OP_DEFI_TX_VOTE: (vote) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_governance_1.CVote.OP_CODE,
        name: dftx_governance_1.CVote.OP_NAME,
        data: vote
    });
},
OP_DEFI_TX_ICX_SUBMIT_DFC_HTLC: (icxSubmitDFCHTLC) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXSubmitDFCHTLC.OP_CODE,
        name: dftx_icxorderbook_1.CICXSubmitDFCHTLC.OP_NAME,
        data: icxSubmitDFCHTLC
    });
},
OP_DEFI_TX_ICX_SUBMIT_EXT_HTLC: (icxSubmitEXTHTLC) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXSubmitEXTHTLC.OP_CODE,
        name: dftx_icxorderbook_1.CICXSubmitEXTHTLC.OP_NAME,
        data: icxSubmitEXTHTLC
    });
},
OP_DEFI_TX_ICX_CLAIM_DFC_HTLC: (icxClaimDFCHTLC) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_icxorderbook_1.CICXClaimDFCHTLC.OP_CODE,
        name: dftx_icxorderbook_1.CICXClaimDFCHTLC.OP_NAME,
        data: icxClaimDFCHTLC
    });
},
OP_DEFI_TX_SET_LOAN_SCHEME: (setLoanScheme) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CSetLoanScheme.OP_CODE,
        name: dftx_loans_1.CSetLoanScheme.OP_NAME,
        data: setLoanScheme
    });
},
OP_DEFI_TX_DESTROY_LOAN_SCHEME: (destroyLoanScheme) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CDestroyLoanScheme.OP_CODE,
        name: dftx_loans_1.CDestroyLoanScheme.OP_NAME,
        data: destroyLoanScheme
    });
},
OP_DEFI_TX_SET_DEFAULT_LOAN_SCHEME: (setDefaultLoanScheme) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CSetDefaultLoanScheme.OP_CODE,
        name: dftx_loans_1.CSetDefaultLoanScheme.OP_NAME,
        data: setDefaultLoanScheme
    });
},
OP_DEFI_TX_SET_COLLATERAL_TOKEN: (setCollateralToken) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CSetCollateralToken.OP_CODE,
        name: dftx_loans_1.CSetCollateralToken.OP_NAME,
        data: setCollateralToken
    });
},
OP_DEFI_TX_SET_LOAN_TOKEN: (setLoanToken) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CSetLoanToken.OP_CODE,
        name: dftx_loans_1.CSetLoanToken.OP_NAME,
        data: setLoanToken
    });
},
OP_DEFI_TX_UPDATE_LOAN_TOKEN: (updateLoanToken) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CUpdateLoanToken.OP_CODE,
        name: dftx_loans_1.CUpdateLoanToken.OP_NAME,
        data: updateLoanToken
    });
},
OP_DEFI_TX_CREATE_VAULT: (createVault) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CCreateVault.OP_CODE,
        name: dftx_loans_1.CCreateVault.OP_NAME,
        data: createVault
    });
},
OP_DEFI_TX_UPDATE_VAULT: (updateVault) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CUpdateVault.OP_CODE,
        name: dftx_loans_1.CUpdateVault.OP_NAME,
        data: updateVault
    });
},
OP_DEFI_TX_DEPOSIT_TO_VAULT: (depositToVault) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CDepositToVault.OP_CODE,
        name: dftx_loans_1.CDepositToVault.OP_NAME,
        data: depositToVault
    });
},
OP_DEFI_TX_WITHDRAW_FROM_VAULT: (WithdrawFromVault) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CWithdrawFromVault.OP_CODE,
        name: dftx_loans_1.CWithdrawFromVault.OP_NAME,
        data: WithdrawFromVault
    });
},
OP_DEFI_TX_CLOSE_VAULT: (closeVault) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CCloseVault.OP_CODE,
        name: dftx_loans_1.CCloseVault.OP_NAME,
        data: closeVault
    });
},
OP_DEFI_TX_TAKE_LOAN: (takeLoan) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CTakeLoan.OP_CODE,
        name: dftx_loans_1.CTakeLoan.OP_NAME,
        data: takeLoan
    });
},
OP_DEFI_TX_PAYBACK_LOAN: (paybackLoan) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CPaybackLoan.OP_CODE,
        name: dftx_loans_1.CPaybackLoan.OP_NAME,
        data: paybackLoan
    });
},
OP_DEFI_TX_PAYBACK_LOAN_V2: (paybackLoanV2) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CPaybackLoanV2.OP_CODE,
        name: dftx_loans_1.CPaybackLoanV2.OP_NAME,
        data: paybackLoanV2
    });
},
OP_DEFI_TX_AUCTION_BID: (placeAuctionBid) => {
    return new dftx_1.OP_DEFI_TX({
        signature: dftx_2.CDfTx.SIGNATURE,
        type: dftx_loans_1.CPlaceAuctionBid.OP_CODE,
        name: dftx_loans_1.CPlaceAuctionBid.OP_NAME,
        data: placeAuctionBid
    });
},

// npx @databases/pg-schema-cli --database postgres://elmer:Hcg6a7od!@45.32.184.106:5432/elmer --directory src/__generated__
