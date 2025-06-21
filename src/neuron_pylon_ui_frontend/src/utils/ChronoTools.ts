import { IDL } from "@dfinity/candid";
import {
  ChronoRecord,
  chronoIdlFactory,
} from "@/chrono/declarations/chrono_records/chrono_records.did";

// shift the timestamp to the left by 32 bits and combine it with the id
export const tsid2tid = (ts: number, id: number) => {
  return (BigInt(ts) << 32n) | BigInt(id);
};

let chronoRecordsIDL = chronoIdlFactory({ IDL });

export const decodeRecord = (b: Uint8Array): ChronoRecord => {
  //@ts-ignore
  return IDL.decode([chronoRecordsIDL.ChronoRecord], b)[0];
};
