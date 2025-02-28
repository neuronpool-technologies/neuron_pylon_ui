import { Icon } from "@chakra-ui/react";

const StatIcon = ({ children }: { children: React.ReactElement }) => {
  return (
    <Icon fontSize={45} p={2.5} bg={"bg.emphasized"} borderRadius="full">
      {children}
    </Icon>
  );
};

export default StatIcon;
