import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useColorMode,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { darkColorBox, darkGrayTextColor, lightColorBox, lightGrayTextColor } from "@/colors";

type HintPopoverProps = {
  details: string;
};

const HintPopover = ({ details }: HintPopoverProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <InfoIcon
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          aria-label="Info icon"
          _hover={{
            cursor: "pointer",
          }}
        />
      </PopoverTrigger>
      <PopoverContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
        <PopoverArrow />
        <PopoverBody>{details}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default HintPopover;
