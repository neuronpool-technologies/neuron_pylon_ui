import { Button, Text } from "@chakra-ui/react";
import { BiPlus } from "react-icons/bi";

const CreateVector = () => {
  return (
    <Button variant={"subtle"} colorPalette="blue" rounded="0" size="sm">
      <BiPlus />
      <Text hideBelow={"md"}>Create Vector</Text>
      <Text hideFrom={"md"}>Create</Text>
    </Button>
  );
};

export default CreateVector;
