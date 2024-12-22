import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Input,
  useColorMode,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { darkBorderColor, darkColorBox, lightColorBox } from "@/colors";

const Search = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchText, setSearchText] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleChange = (event) => {
    setSearchText(event.target.value);
  };

  const closeModal = () => {
    setSearchText("");
    onClose();
  };
  
  return (
    <>
      <Button
        onClick={onOpen}
        rounded="full"
        boxShadow="base"
        w="100%"
        variant="outline"
        leftIcon={<SearchIcon />}
      >
        Search
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup w="100%">
              <InputLeftElement pointerEvents="none" h="100%">
                <SearchIcon color={darkBorderColor} />
              </InputLeftElement>
              <Input
                pl={10}
                placeholder="Search (e.g., Vector ID, Controller, ...)"
                size="md"
                value={searchText}
                onChange={handleChange}
              />
            </InputGroup>
            <Flex align="center" mt={3} gap={3}>
              <Button
                boxShadow="base"
                variant="outline"
                rounded="full"
                size="sm"
                leftIcon={<SearchIcon />}
              >
                Neutrinite
              </Button>
              <Button
                boxShadow="base"
                variant="outline"
                rounded="full"
                size="sm"
                leftIcon={<SearchIcon />}
              >
                Sneed
              </Button>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button rounded="full" boxShadow="base" w="100%">
              Search
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Search;
