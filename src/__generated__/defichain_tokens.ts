/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: goO5dOQh5fsrzPdtfMiqdAWyRXMb56uMceYq/vWDPd4SJxi7FcMCuCK5XYua0ZHGwrEyxyxI1fg0eDbn20u/bA==
 */

/* eslint-disable */
// tslint:disable

interface DefichainTokens {
  created_at: (Date) | null
  isdat: (boolean) | null
  isloantoken: (boolean) | null
  islps: (boolean) | null
  minted: (number) | null
  name: (string) | null
  symbol: (string) | null
  tokenaid: number | null
  tokenbid: number | null
  tokenid: (number) | null
}
export default DefichainTokens;

interface DefichainTokens_InsertParameters {
  created_at?: (Date) | null
  isdat?: (boolean) | null
  isloantoken?: (boolean) | null
  islps?: (boolean) | null
  minted?: (number) | null
  name?: (string) | null
  symbol?: (string) | null
  tokenaid?: (number) | null
  tokenbid?: (number) | null
  tokenid?: (number) | null
}
export type {DefichainTokens_InsertParameters}
