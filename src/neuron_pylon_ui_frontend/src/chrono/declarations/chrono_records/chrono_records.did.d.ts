import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';


export declare const chronoIdlFactory: IDL.InterfaceFactory;

export type C100_Account = { 'sent': Sent } |
{ 'received': Received };

export interface Account {
    'owner': Principal,
    'subaccount': [] | [Uint8Array | number[]],
}

export interface Received {
    'from': { 'icp': Uint8Array | number[] } |
    { 'icrc': Account },
    'ledger': Principal,
    'amount': bigint,
}

export interface Sent {
    'to': { 'icp': Uint8Array | number[] } |
    { 'icrc': Account },
    'ledger': Principal,
    'amount': bigint,
}

export interface Swap {
    'from': Account,
    'to': Account,
    'amountIn': bigint,
    'amountOut': bigint,
    'zeroForOne': boolean,
    'newPrice': number,
}

export interface LiquidityAdd {
    'fromA': Account,
    'amountA': bigint,
    'fromB': Account,
    'to': Account,
    'amountB': bigint,
}

export interface LiquidityRemove {
    'from': Account,
    'toA': Account,
    'amountA': bigint,
    'toB': Account,
    'amountB': bigint,
}

export type C200_Dex = { 'swap': Swap } |
    { 'liquidityAdd': LiquidityAdd } |
    { 'liquidityRemove': LiquidityRemove };

export type ChronoRecord = { 'account' : C100_Account } |
    { 'dex': C200_Dex } 