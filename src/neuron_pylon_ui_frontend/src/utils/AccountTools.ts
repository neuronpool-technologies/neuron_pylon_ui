import { decodeIcrcAccount, encodeIcrcAccount } from "@dfinity/ledger-icrc";
import {
  Account,
  AccountEndpoint,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { e8sToIcp } from "./TokenTools";
import { match, P } from "ts-pattern";

export const stringToIcrcAccount = (account: string): Account => {
  const { owner, subaccount } = decodeIcrcAccount(account);

  return {
    owner,
    subaccount: subaccount ? [subaccount] : [],
  };
};

// form helper
export const isAccountOkay = (account: string): boolean => {
  if (account === "") return true;

  try {
    decodeIcrcAccount(account);
  } catch (error) {
    return false;
  }

  return true;
};

export const isBalanceOkay = (
  balance: number,
  amount: number,
  tokenFee: number
): boolean => {
  if (amount === 0) return true;
  if (amount < tokenFee) return false;

  return balance >= amount;
};

export const endpointToBalanceAndAccount = (
  endpoint: AccountEndpoint
): { balance: number; account: string; ledger: string } => {
  const source = match(endpoint.endpoint)
    .with({ ic: P.select() }, (x) => x)
    .otherwise(() => {
      throw new Error('"ic" property is missing from the endpoint object.');
    });

  return {
    balance: e8sToIcp(Number(endpoint.balance)),
    account: accountToString(source.account),
    ledger: source.ledger.toString(),
  };
};

export const accountToString = (account: Account): string => {
  return encodeIcrcAccount({
    owner: account.owner,
    subaccount: account.subaccount[0],
  });
};
