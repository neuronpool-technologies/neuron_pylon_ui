import React from "react";
import {
  Box,
  Flex,
  Spacer,
  Image as ChakraImage,
  useColorMode,
  Divider,
} from "@chakra-ui/react";
import xLogo from "../../assets/x_logo.svg";
import discordLogo from "../../assets/discord_logo.svg";
import githubLogo from "../../assets/github_logo.svg";
import { darkBorderColor, lightBorderColor } from "@/colors";
import logoHorizontalLight from "../../assets/logo_horizontal_light.svg";
import logoHorizontalDark from "../../assets/logo_horizontal_dark.svg";

type SocialIconLinkProps = {
  image: string;
  alt: string;
  link: string;
  xLogo?: boolean;
};

const Footer = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box w="100%" mt={6}>
      <Flex w="100%">
        <Divider mx={6} />
      </Flex>
      <Flex
        direction={{ base: "column", md: "row" }}
        my={4}
        mx={6}
        gap={3}
        align="center"
      >
        <ChakraImage
          src={colorMode === "light" ? logoHorizontalLight : logoHorizontalDark}
          alt="NeuronPool logo displayed horizontally"
          h={35}
        />
        {/* <Terms /> */}
        <Spacer />
        <Flex align="center" gap={3}>
          <SocialIconLink
            image={xLogo}
            alt={"twitter link"}
            link={"https://x.com/NeuronPool"}
            xLogo
          />
          <SocialIconLink
            image={discordLogo}
            alt={"discord link"}
            link={"https://discord.gg/5jRHUYnsrM"}
          />
          <SocialIconLink
            image={githubLogo}
            alt={"github link"}
            link={"https://github.com/neuronpool-technologies"}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;

const SocialIconLink = ({ image, alt, link, xLogo }: SocialIconLinkProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Box
        rounded="full"
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        p={2}
        boxShadow="base"
        _hover={{ opacity: "0.8", cursor: "pointer" }}
      >
        <ChakraImage h={"22px"} p={xLogo ? "3px" : 0} src={image} alt={alt} />
      </Box>
    </a>
  );
};
