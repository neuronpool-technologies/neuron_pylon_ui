import { IDL } from "@dfinity/candid";
import {
  ChronoRecord,
  chronoIdlFactory,
} from "@/chrono/declarations/chrono_records/chrono_records.did";
import { ChronoChannelShared } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "./TokenTools";

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
  // other_account: string;
  amount: string;
} => {
  return match(record)
    .with({ account: P.select() }, (account) => {
      return match(account)
        .with({ sent: P.select() }, (sent) => {
          return {
            tx_type: "Sent",
            // other_account: sent.to,
            amount: e8sToIcp(Number(sent.amount)).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          };
        })
        .with({ received: P.select() }, (received) => {
          return {
            tx_type: "Received",
            // other_account: received.from,
            amount: e8sToIcp(Number(received.amount)).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ),
          };
        })
        .exhaustive();
    })
    .otherwise(() => {
      return {
        tx_type: "unknown",
        // other_account: "",
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
