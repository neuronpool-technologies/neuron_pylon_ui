import { startNeuronPylonClient } from "../Client";
import { showToast } from "../../tools/toast";

export const InitBilling = async () => {
  try {
    const pylon = await startNeuronPylonClient();
    const meta = await pylon.icrc55_get_pylon_meta();

    return {
      min_create_balance: meta.billing.min_create_balance.toString(),
      operation_cost: meta.billing.operation_cost.toString(),
      transaction_percentage_fee_e8s:
        meta.modules[0].billing[0].transaction_fee.transaction_percentage_fee_e8s.toString(),
      cost_per_day: meta.modules[0].billing[1].cost_per_day.toString(),
    };
  } catch (error) {
    console.error(error);

    showToast({
      title: "Error fetching meta information",
      description: `${error.toString().substring(0, 200)}...`,
      status: "warning",
    });

    return {
      min_create_balance: "",
      operation_cost: "",
      transaction_percentage_fee_e8s: "",
      cost_per_day: "",
    };
  }
};
