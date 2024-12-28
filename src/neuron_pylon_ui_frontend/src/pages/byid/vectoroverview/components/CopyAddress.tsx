import React from "react";
import { useClipboard, IconButton } from "@chakra-ui/react";
import { CopyIcon, CheckIcon, Flex, Spacer } from "@chakra-ui/icons";

type CopyAddressProps = { address: string };

const CopyAddress = ({ address }: CopyAddressProps) => {
  const { hasCopied, onCopy } = useClipboard(address);

  return (
    <Flex w="100%" align="center" mt={3}>
      <Spacer />
      <IconButton
        aria-label="Copy address"
        rounded="full"
        boxShadow="base"
        icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
        size="sm"
        onClick={onCopy}
      />
    </Flex>
  );
};

export default CopyAddress;
