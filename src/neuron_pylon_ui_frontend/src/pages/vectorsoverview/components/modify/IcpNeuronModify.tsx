import { useState } from "react";
import { Flex, Input } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { isAccountOkay } from "@/utils/AccountTools";
import {
  NodeShared,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";

const IcpNeuronModify = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { destinations } = extractNodeType(vector, meta);
  const [saving, setSaving] = useState<boolean>(false);
  
  const [modify, setModify] = useState({
    maturityDestination: "",
    disburseDestination: "",
  });

  return (
    <Flex
      align="center"
      direction={{ base: "column", md: "row" }}
      w="100%"
      gap={6}
    >
      <Flex direction={"column"} gap={3} w="100%">
        <Field
          label={"Maturity destination"}
          invalid={!isAccountOkay(modify.maturityDestination)}
          disabled={saving}
        >
          <Input
            placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
            size="lg"
            bg={!isAccountOkay(modify.maturityDestination) ? "bg.error" : ""}
            onChange={(e) =>
              setModify((prevState) => ({
                ...prevState,
                maturityDestination: e.target.value,
              }))
            }
            value={modify.maturityDestination}
          />
        </Field>
        <Field label={"Disburse destination"}>
          <Input
            placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
            size="lg"
            bg={!isAccountOkay(modify.disburseDestination) ? "bg.error" : ""}
            onChange={(e) =>
              setModify((prevState) => ({
                ...prevState,
                disburseDestination: e.target.value,
              }))
            }
            value={modify.disburseDestination}
          />
        </Field>
      </Flex>
    </Flex>
  );
};

export default IcpNeuronModify;
