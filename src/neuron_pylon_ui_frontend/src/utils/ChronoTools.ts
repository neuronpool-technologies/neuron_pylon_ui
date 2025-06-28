import { IDL } from "@dfinity/candid";
import {
  ChronoRecord,
  chronoIdlFactory,
} from "@/chrono/declarations/chrono_records/chrono_records.did";
import { ChronoChannelShared } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "./TokenTools";
import { SearchResp } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import { accountToString } from "./AccountTools";
import { accountIdentifierFromBytes } from "@dfinity/ledger-icp";

export const processChronoLogTransactions = (
  chronoLog: SearchResp,
  options?: {
    vectorId?: number;
    limit?: number;
  }
): SearchResp => {
  const { vectorId, limit = 6 } = options || {};

  // Filter transactions if vectorId is provided
  const filteredLog = vectorId !== undefined
    ? chronoLog.filter(
        (transaction) =>
          transaction[1] &&
          "vectorId" in transaction[1] &&
          transaction[1].vectorId === vectorId
      )
    : chronoLog;

  // Extract and flatten all entries with timestamps
  const allEntries: Array<{
    txId: string;
    chronoId: bigint;
    value: any;
    timestamp: number;
    vectorId: number;
  }> = [];

  filteredLog.forEach((tx) => {
    match(tx[1])
      .with({ CANDID: P.select() }, (CANDID) => {
        CANDID.forEach(([chronoId, value]) => {
          const [timestamp] = chronoIdToTsid(chronoId);
          allEntries.push({
            txId: tx[0],
            chronoId,
            value,
            timestamp,
            vectorId: "vectorId" in tx[1] ? (tx[1].vectorId as number) : 0,
          });
        });
      })
      .otherwise(() => {});
  });

  // Sort by timestamp (newest first)
  const sortedEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);

  // Apply limit and create individual entries
  const limitedEntries = sortedEntries.slice(0, limit);

  // Create final result where each entry is separate
  return limitedEntries.map(({ txId, chronoId, value, vectorId }) => [
    txId,
    {
      CANDID: [[chronoId, value]],
      vectorId,
    },
  ]);
};

export const extractDataFromChronoRecord = (
  data: [string, ChronoChannelShared]
): {
  vector_id: number;
  vector_account: string;
  chrono_record: { id: number; timestamp: number; value: ChronoRecord }[];
} => {
  const vectorAccount = data[0].split("/a/")[1];
  const vectorId: number =
    "vectorId" in data[1] ? (data[1].vectorId as number) : 0;

  const results: { id: number; timestamp: number; value: ChronoRecord }[] = [];

  match(data[1]).with({ CANDID: P.select() }, (CANDID) => {
    for (let [chronoId, value] of CANDID) {
      const [timestamp, id] = chronoIdToTsid(chronoId);
      const decodedValue = decodeRecord(value as Uint8Array);
      results.push({
        id,
        timestamp,
        value: decodedValue,
      });
    }
  });

  return {
    vector_id: vectorId,
    vector_account: vectorAccount,
    chrono_record: results,
  };
};

export const extractTransactionTypeFromChronoRecord = (
  record: ChronoRecord
): {
  tx_type: string;
  other_account: string;
  amount: string;
} => {
  return match(record)
    .with({ account: P.select() }, (account) => {
      return match(account)
        .with({ sent: P.select() }, (sent) => {

          let otherAccount: string = match(sent.to)
            .with({ icrc: P.select() }, (icrc) => {
              return accountToString(icrc);
            })
            .with({ icp: P.select() }, (icp) => {
              return accountIdentifierFromBytes(icp as Uint8Array);
            })
            .exhaustive();

          return {
            tx_type: "Sent",
            other_account: otherAccount,
            amount: e8sToIcp(Number(sent.amount)).toLocaleString(undefined, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            }),
          };
        })
        .with({ received: P.select() }, (received) => {
          let otherAccount: string = match(received.from)
            .with({ icrc: P.select() }, (icrc) => {
              return accountToString(icrc);
            })
            .with({ icp: P.select() }, (icp) => {
              return accountIdentifierFromBytes(icp as Uint8Array);
            })
            .exhaustive();

          return {
            tx_type: "Received",
            other_account: otherAccount,
            amount: `+${e8sToIcp(Number(received.amount)).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              }
            )}`,
          };
        })
        .exhaustive();
    })
    .otherwise(() => {
      return {
        tx_type: "unknown",
        other_account: "",
        amount: "0.00",
      };
    });
};

// shift the timestamp to the left by 32 bits and combine it with the id
export const tsid2tid = (ts: number, id: number) => {
  return (BigInt(ts) << 32n) | BigInt(id);
};

export const chronoIdToTsid = (tid: bigint): [number, number] => {
  const ts = Number(tid >> 32n);
  const id = Number(tid & 0xffffffffn);
  return [ts, id];
};

let chronoRecordsIDL = chronoIdlFactory({ IDL });

export const decodeRecord = (b: Uint8Array): ChronoRecord => {
  //@ts-ignore
  return IDL.decode([chronoRecordsIDL.ChronoRecord], b)[0];
};
