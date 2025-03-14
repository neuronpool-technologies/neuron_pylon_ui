import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  Image as ChakraImage,
  IconButton,
  Spacer,
  Separator,
} from "@chakra-ui/react";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import logoLight from "../../../assets/logo_horizontal_light.svg";
import logoDark from "../../../assets/logo_horizontal_dark.svg";
import { NavLink } from "react-router-dom";
import { BiHome, BiRefresh, BiMenu, BiMoon, BiSun } from "react-icons/bi";
import Social from "../footer/Social";
import { useColorMode } from "@/components/ui/color-mode";
import Wallet from "../wallet/Wallet";

const LinkItems = [
  {
    name: "Home",
    link: "/",
    icon: <BiHome />,
  },
  {
    name: "Vectors",
    link: "/vectors",
    icon: <BiRefresh />,
  },
];

const Nav = () => {
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <>
      <Box px={{ base: 3, md: 6 }} bg="bg.subtle" w="100%">
        <Flex h={20} align="center" justify="center" gap={3}>
          <MobileNav />
          <Spacer hideFrom={"md"} />
          <NavLink to="/">
            <ChakraImage
              alt="NeuronPool logo"
              h={35}
              src={colorMode === "light" ? logoLight : logoDark}
            />
          </NavLink>
          <Flex ms={5} gap={5} hideBelow="md">
            {LinkItems.map((link) => (
              <NavItem
                key={link.name}
                name={link.name}
                link={link.link}
                icon={link.icon}
              />
            ))}
          </Flex>
          <Spacer />
          <Wallet />
          <Flex hideBelow="md">
            <ColorModeButton />
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Nav;

const ColorModeButton = () => {
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <>
      <IconButton
        onClick={() => toggleColorMode()}
        variant="surface"
        rounded="md"
        boxShadow="xs"
        hideBelow={"md"}
        aria-label="Color mode"
      >
        {colorMode === "light" ? <BiSun /> : <BiMoon />}
      </IconButton>
      <Button
        onClick={() => toggleColorMode()}
        variant="surface"
        rounded="md"
        boxShadow="xs"
        hideFrom={"md"}
      >
        {colorMode === "light" ? (
          <>
            <BiSun />
            Light
          </>
        ) : (
          <>
            <BiMoon />
            Dark
          </>
        )}
      </Button>
    </>
  );
};

type NavItemProps = {
  link: string;
  name: string;
  icon: React.ReactElement;
  setOpen?: (open: boolean) => void;
};

const NavItem = ({ link, name, icon, setOpen }: NavItemProps) => {
  return (
    <NavLink to={link}>
      {({ isActive }) => (
        <Button
          variant={"plain"}
          rounded="md"
          fontWeight={"bold"}
          w="100%"
          size="xl"
          _hover={{ opacity: "0.8" }}
          justifyContent={"flex-start"}
          onClick={() => setOpen && setOpen(false)}
          colorPalette={isActive ? "blue" : ""}
        >
          {icon}
          {name}
        </Button>
      )}
    </NavLink>
  );
};

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <DrawerRoot
      placement={"start"}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      trapFocus={false}
    >
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <IconButton
          variant="ghost"
          rounded="md"
          size="sm"
          hideFrom="md"
          aria-label="Menu"
        >
          <BiMenu style={{ width: "30px", height: "30px" }} />
        </IconButton>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <ChakraImage
            alt="NeuronPool logo"
            h={35}
            src={colorMode === "light" ? logoLight : logoDark}
          />
        </DrawerHeader>
        <DrawerBody>
          <Flex direction="column" gap={5}>
            <Separator />
            {LinkItems.map((link) => (
              <Flex key={link.name} direction="column" gap={5}>
                <NavItem
                  name={link.name}
                  link={link.link}
                  icon={link.icon}
                  setOpen={setOpen}
                />
                <Separator />
              </Flex>
            ))}
          </Flex>
        </DrawerBody>
        <DrawerFooter>
          <ColorModeButton />
          <Spacer />
          <Social />
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};
