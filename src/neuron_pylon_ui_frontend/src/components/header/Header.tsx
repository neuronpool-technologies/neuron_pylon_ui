import { Container, Box } from "@chakra-ui/react";

type HeaderProps = {
  children?: React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  return (
    <Box
      bg="bg.subtle"
      w="100%"
      h={"200px"}
      boxShadow="0px 4px 6px 0px rgba(0, 0, 0, 0.1)"
    >
      <Container pt={8}>{children}</Container>
    </Box>
  );
};

export default Header;
