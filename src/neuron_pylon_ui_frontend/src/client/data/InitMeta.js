import { startNeuronPylonClient } from "../Client";
import { showToast } from "../../tools/toast";
import { deepConvertToString } from "../../tools/conversions";

export const InitMeta = async () => {
  try {
    const pylon = await startNeuronPylonClient();
    const { name, governed_by, billing, modules } =
      await pylon.icrc55_get_pylon_meta();

    return {
      name: name,
      governed_by: governed_by,
      billing: deepConvertToString(billing),
      modules: deepConvertToString(modules),
    };
  } catch (error) {
    console.error(error);

    showToast({
      title: "Error fetching meta information",
      description: `${error.toString().substring(0, 200)}...`,
      status: "warning",
    });

    return {
      name: "",
      governed_by: "",
      billing: "",
      modules: "",
    };
  }
};
