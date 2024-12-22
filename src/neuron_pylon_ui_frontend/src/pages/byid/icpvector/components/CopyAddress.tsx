import React from "react";
import { useClipboard, IconButton } from "@chakra-ui/react";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";

const CopyAddress = ({ address }: { address: string }) => {
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
