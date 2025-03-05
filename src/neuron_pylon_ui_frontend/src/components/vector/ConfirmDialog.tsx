import React from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BiCheck } from "react-icons/bi";
import { Button } from "@chakra-ui/react";

interface ConfirmDialogProps {
  confirmTitle: string;
  openDisabled: boolean;
  buttonIcon: React.ReactNode;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => Promise<void>;
  loading: boolean;
  children: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  confirmTitle,
  openDisabled,
  buttonIcon,
  isOpen,
  setOpen,
  onConfirm,
  loading,
  children,
}) => {
  return (
    <DialogRoot
      lazyMount
      placement={"center"}
      motionPreset="slide-in-bottom"
      open={isOpen}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>
        <Button
          disabled={openDisabled}
          variant="surface"
          colorPalette={"gray"}
          rounded="md"
          boxShadow="xs"
          w="100%"
        >
          {buttonIcon} {confirmTitle}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {confirmTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        <DialogFooter>
          <Button
            disabled={openDisabled}
            variant="surface"
            colorPalette={"gray"}
            rounded="md"
            boxShadow="xs"
            w="100%"
            onClick={onConfirm}
            loading={loading}
            colorScheme="blue"
          >
            <BiCheck />
            Confirm {confirmTitle}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ConfirmDialog;
