import React from "react";
import { useClipboard, IconButton } from "@chakra-ui/react";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";

type CopyAddressProps = { address: string };

const CopyAddress = ({ address }: CopyAddressProps) => {
  const { hasCopied, onCopy } = useClipboard(address);

  return (
    <IconButton
      aria-label="Copy address"
      rounded="full"
      boxShadow="base"
      icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
      size="sm"
      onClick={onCopy}
    />
  );
};

export default CopyAddress;
