import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { useTypedSelector } from "@/hooks/useRedux";
import { extractNodeType } from "@/utils/Node";

const Modify = ({ vector }: { vector: NodeShared }) => {
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;

  const { type, symbol } = extractNodeType(vector, meta);
  return <>modify</>;
};

export default Modify;