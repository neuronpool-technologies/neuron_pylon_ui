import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

export const showToast = ({ title, description, status }) => {
  const toastId = title;

  if (!toast.isActive(toastId)) {
    toast({
      title: title,
      id: toastId,
      description: description,
      status: status,
      position: "bottom-right",
      duration: 6000,
      isClosable: true,
      containerStyle: {
        maxWidth: "30%",
      },
    });
  }
};
