import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

type ToastProps = {
  title: string;
  description: string;
  status: string;
};

export const showToast = ({ title, description, status }: ToastProps) => {
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
    } as UseToastOptions);
  }
};
