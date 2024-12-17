import React from "react";
import {
  Box,
  Flex,
  Button,
  useBreakpointValue,
  Stack,
  useColorMode,
  Image as ChakraImage,
  HStack,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Divider,
  useDisclosure,
  VStack,
  Spacer,
} from "@chakra-ui/react";
import {
  MoonIcon,
  SunIcon,
  UpDownIcon,
  HamburgerIcon,
  CopyIcon,
} from "@chakra-ui/icons";
import logo from "../../assets/logo.svg";
import { NavLink } from "react-router-dom";
import { darkColor, lightColor } from "../colors";
import Search from "./Search";

const LinkItems = [
  {
    name: "Vectors",
    link: "/",
    icon: <UpDownIcon transform="rotate(90deg)" />,
  },
  {
    name: "Wallet",
    link: "/wallet",
    icon: <CopyIcon transform="rotate(90deg)" />,
  },
];

const Nav = () => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Box px={{ base: 3, md: 6 }}>
        <Flex h={20} align="center">
          <NavLink to="/">
            <ChakraImage alt="NeuronPool logo" h={35} src={logo} />
          </NavLink>
          {isDesktop ? (
            <HStack ms={5} fontWeight={700} fontSize={16}>
              {LinkItems.map((link) => (
                <NavItem
                  key={link.name}
                  name={link.name}
                  link={link.link}
                  icon={link.icon}
                />
              ))}
            </HStack>
          ) : null}
          <Spacer />
          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={3}>
              <Search />
              {isDesktop ? (
                <Button
                  onClick={toggleColorMode}
                  aria-label="Change color mode"
                  rounded="full"
                  boxShadow="base"
                >
                  {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>
              ) : null}
              {!isDesktop ? <MobileMenu /> : null}
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Nav;

const NavItem = ({ link, name, icon }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <NavLink to={link}>
        {({ isActive }) => (
          <Box pb={0.5}>
            <Flex
              align="center"
              justify="center"
              py="2"
              px="3"
              m="1"
              cursor="pointer"
              fontWeight={600}
              color={
                isActive
                  ? colorMode === "light"
                    ? "#3182ce"
                    : "#90ccf4"
                  : colorMode === "light"
                  ? darkColor
                  : lightColor
              }
              _hover={{
                opacity: "0.8",
              }}
              gap={2}
            >
              {icon}
              {name}
            </Flex>
          </Box>
        )}
      </NavLink>
    </>
  );
};

const MobileMenu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <IconButton
        icon={<HamburgerIcon />}
        onClick={onOpen}
        rounded="full"
        boxShadow="base"
        aria-label="Toggle navigation menu"
      />
      <Drawer onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={colorMode === "light" ? lightColor : darkColor}>
          <DrawerHeader>
            <Button onClick={toggleColorMode} rounded="full" boxShadow="base">
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <VStack
              fontWeight={700}
              fontSize={28}
              onClick={onClose}
              align="start"
            >
              <Divider />
              {LinkItems.map((link) => (
                <VStack key={link.name} w="100%" align="start">
                  <NavItem name={link.name} link={link.link} icon={link.icon} />
                  <Divider />
                </VStack>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
