import React from "react";
import {
  Box,
  Flex,
  Button,
  Image as ChakraImage,
  IconButton,
  Spacer,
  Separator,
} from "@chakra-ui/react";
import xLogo from "../../../assets/x_logo.svg";
import discordLogo from "../../../assets/discord_logo.svg";
import githubLogo from "../../../assets/github_logo.svg";

const LinkItems = [
  {
    name: "X link",
    link: "https://x.com/NeuronPool",
    icon: xLogo,
  },
  {
    name: "Discord link",
    link: "https://discord.gg/5jRHUYnsrM",
    icon: discordLogo,
  },
  {
    name: "Github link",
    link: "https://github.com/neuronpool-technologies",
    icon: githubLogo,
  },
];

const Social = () => {
  return (
    <>
      {LinkItems.map((link) => (
        <SocialIconLink
          key={link.name}
          image={link.icon}
          alt={link.name}
          link={link.link}
          xLogo={link.name === "X link"}
        />
      ))}
    </>
  );
};

export default Social;

type SocialIconLinkProps = {
  image: string;
  alt: string;
  link: string;
  xLogo?: boolean;
};

const SocialIconLink = ({ image, alt, link, xLogo }: SocialIconLinkProps) => {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <IconButton variant="surface" rounded="md" boxShadow="xs" aria-label={alt}>
        <ChakraImage h={"22px"} p={xLogo ? "3px" : 0} src={image} alt={alt} />
      </IconButton>
    </a>
  );
};
