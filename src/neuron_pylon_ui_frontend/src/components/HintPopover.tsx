import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useColorMode,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { darkColorBox, darkGrayTextColor, lightColorBox, lightGrayTextColor } from "@/colors";

type HintPopoverProps = {
  details: string;
};

const HintPopover = ({ details }: HintPopoverProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Popover>
      <PopoverTrigger>
        <InfoOutlineIcon
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          aria-label="Info icon"
          boxSize={3.5}
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
