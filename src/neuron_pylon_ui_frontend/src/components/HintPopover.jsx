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
import { darkColorBox, lightColorBox } from "../colors";

const HintPopover = ({ details }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <InfoIcon
          color="gray.500"
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
