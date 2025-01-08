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
  Text,
} from "@chakra-ui/react";
import { SearchIcon, WarningIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { darkBorderColor, darkColorBox, lightColorBox } from "@/colors";
import { startNeuronPylonClient } from "@/client/Client";
import {
  encodeIcrcAccount,
  decodeIcrcAccount,
  IcrcAccount,
} from "@dfinity/ledger-icrc";

const Search = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const search = async (dao?: string) => {
    try {
      setLoading(true);
      setErrorMsg("");

      if (dao) {
        setSearchText(dao);
        navigate(`/controller/${dao}`);
      }

      if (searchText && Number.isFinite(Number(searchText))) {
        const pylon = await startNeuronPylonClient();
        const nodeRes = await pylon.icrc55_get_nodes([
          { id: Number(searchText) },
        ]);

        const node = nodeRes[0][0];

        if (node) {
          const controllerAccount = encodeIcrcAccount({
            owner: node.controllers[0].owner,
            subaccount: node.controllers[0].subaccount[0],
          });

          navigate(`/controller/${controllerAccount}/id/${node.id}`);
        } else {
          throw new Error("Vector ID not found!");
        }
      } else if (searchText) {
        const pylon = await startNeuronPylonClient();

        const accountController: IcrcAccount = decodeIcrcAccount(searchText);

        const nodes = await pylon.icrc55_get_controller_nodes({
          id: {
            owner: accountController.owner,
            subaccount: accountController.subaccount
              ? [accountController.subaccount]
              : [],
          },
          start: 0,
          length: 100,
        });

        if (nodes.length > 0) {
          navigate(`/controller/${searchText}`);
        } else {
          throw new Error("Vector controller not found!");
        }
      }

      setSearchText("");
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      setErrorMsg(error.toString());
    }
  };

  const closeModal = () => {
    setErrorMsg("");
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
        leftIcon={<SearchIcon />}
      >
        Search
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
          <ModalHeader sx={{ textAlign: "center" }}>Search</ModalHeader>
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
                isInvalid={errorMsg ? true : false}
                value={searchText}
                autoFocus
                onKeyDown={(e) => (e.key === "Enter" ? search() : null)}
                onChange={(event) => {
                  setSearchText(event.target.value);
                }}
              />
            </InputGroup>
            <Flex align="center" mt={3} gap={3}>
              <Button
                boxShadow="base"
                variant="outline"
                rounded="full"
                size="sm"
                leftIcon={<SearchIcon />}
                onClick={() => search("eqsml-lyaaa-aaaaq-aacdq-cai")}
              >
                Neutrinite DAO
              </Button>
              <Button
                boxShadow="base"
                variant="outline"
                rounded="full"
                size="sm"
                leftIcon={<SearchIcon />}
                onClick={() => search("fi3zi-fyaaa-aaaaq-aachq-cai")}
              >
                Sneed DAO
              </Button>
            </Flex>
            {errorMsg ? (
              <Text mt={3} size="sm" color="red.500">
                <WarningIcon /> {errorMsg}
              </Text>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              rounded="full"
              boxShadow="base"
              w="100%"
              type="submit"
              isDisabled={!searchText}
              isLoading={loading}
              onClick={() => search()}
            >
              Search
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Search;
