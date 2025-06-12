import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { toaster } from "@/components/ui/toaster";

type FetchMetaResp = {
  meta: PylonMetaResp;
  prices: Array<Record<string, any>> | null;
};

export const fetchMeta = async ({
  pylon,
}: {
  pylon: ActorSubclass<NeuronPylon>;
}): Promise<FetchMetaResp | null> => {
  try {
    const pricesApi = "https://api.kongswap.io/api/coinmarketcap/ticker";

    let prices: any = null;
    try {
      const response = await fetch(pricesApi);
      prices = await response.json();
    } catch (pricesError) {
      console.warn("Failed to fetch prices:", pricesError);
      prices = null;
    }

    const meta = await pylon.icrc55_get_pylon_meta();

    let pricesNeeded: Array<Record<string, any>> | null = null;

    // Only process prices if we successfully fetched them and they're valid
    if (prices && typeof prices === "object") {
      pricesNeeded = [];
      for (let ledger of meta.supported_ledgers) {
        // Check for symbol_ICP pair
        const symbolIcpPair = `${ledger.symbol}_ckUSDT`;
        if (prices[symbolIcpPair]) {
          pricesNeeded.push({
            symbol: ledger.symbol,
            ...prices[symbolIcpPair],
          });
        }
      }

      // Check for ICP_ckUSDT pair to get USD conversion
      if (prices["ICP_ckUSDT"]) {
        pricesNeeded.push({
          symbol: "ICP",
          ...prices["ICP_ckUSDT"],
        });
      }
    }

    return { meta: meta, prices: pricesNeeded };
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching meta information",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return null;
  }
};
