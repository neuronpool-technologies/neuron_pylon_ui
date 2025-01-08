import React, { useState } from "react";
import {
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Flex,
  Text,
  Image as ChakraImage,
  useColorMode,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import IcLogo from "../../../../assets/ic-logo.png";
import NtnLogo from "../../../../assets/ntn-logo.png";
import { Auth } from "@/components";
import { useTypedSelector } from "@/hooks/hooks";
import { e8sToIcp } from "@/tools/conversions";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";

const Create = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logged_in, principal } = useTypedSelector((state) => state.Profile);

  const [maturityDestination, setMaturityDestination] = useState<string>("");
  const [billingOption, setBillingOption] = useState<number>(0);
  const [dissolveDelayOption, setDissolveDelayOption] =
    useState<string>("Default");
  const [customDissolveDelay, setCustomDissolveDelay] = useState<number>(0);

  const { modules } = useTypedSelector((state) => state.Meta);

  const maturityDestinationIsOkay = (destination: string): boolean => {
    try {
      decodeIcrcAccount(destination);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <Flex direction="column" gap={3} w="100%">
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Maturity destination
        </Text>
        <InputGroup>
          <InputLeftElement pointerEvents="none" h="100%">
            <ChakraImage
              src={IcLogo}
              alt="Internet identity logo"
              h={"20px"}
              w={"auto"}
            />
          </InputLeftElement>
          <Input
            pl={10}
            placeholder={"Principal, ICRC-1 (e.g., ntohy-uex..., ...)"}
            size="lg"
            value={maturityDestination}
            isInvalid={
              maturityDestination !== ""
                ? !maturityDestinationIsOkay(maturityDestination)
                : false
            }
            // isDisabled={staking}
            type="text"
            onChange={(event) => setMaturityDestination(event.target.value)}
          />
        </InputGroup>
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Dissolve delay
        </Text>
        <Select
          variant="outline"
          size={"lg"}
          onChange={(event) => setDissolveDelayOption(event.target.value)}
        >
          <option value={"Default"}>6 months</option>
          <option value={"8Years"}>8 years</option>
          <option value={"Custom"}>Custom</option>
        </Select>
        {dissolveDelayOption === "Custom" ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <LockIcon />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Days (e.g., 184, 2922, ...)"}
              size="lg"
              type="number"
              onChange={(event) =>
                setCustomDissolveDelay(Number(event.target.value))
              }
            />
          </InputGroup>
        ) : null}
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Billing option
        </Text>
        <Select
          variant="outline"
          size={"lg"}
          onChange={(event) => setBillingOption(Number(event.target.value))}
        >
          {modules.length > 0 ? (
            modules[0].billing.map((billing, index) => (
              <option value={index} key={index}>
                {billing.cost_per_day > 0
                  ? `${e8sToIcp(Number(billing.cost_per_day))} NTN per day`
                  : "transaction_percentage_fee_e8s" in billing.transaction_fee
                  ? `${
                      (Number(
                        billing.transaction_fee.transaction_percentage_fee_e8s
                      ) /
                        100_000_000) *
                      100
                    }% of Maturity`
                  : null}
              </option>
            ))
          ) : (
            <option>...</option>
          )}
        </Select>
        {billingOption === 1 ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <ChakraImage src={NtnLogo} alt="NTN logo" h={"20px"} w={"auto"} />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Deposit NTN (e.g., 300, 5000, ...)"}
              size="lg"
              type="number"
              // onChange={(event) =>
              //   setCustomDissolveDelay(Number(event.target.value))
              // }
            />
          </InputGroup>
        ) : null}
      </Flex>

      {logged_in ? (
        <>
          <Button
            // onClick={onOpen}
            rounded="full"
            boxShadow="base"
            w="100%"
            colorScheme="blue"
            isDisabled={
              maturityDestination !== ""
                ? !maturityDestinationIsOkay(maturityDestination)
                : true
            }
            // isDisabled={
            //   (!staked && Number(icp_balance) < Number(minimum_stake)) ||
            //   icpToE8s(Number(amount)) <
            //     Number(minimum_stake) + networkFeeE8s * 2 ||
            //   (!staked && icpToE8s(Number(amount)) > Number(icp_balance))
            // }
          >
            Create
          </Button>
          {/* 
        <Modal isOpen={isOpen} onClose={closeModal} isCentered>
          <ModalOverlay />
          <ModalContent
            bg={colorMode === "light" ? lightColorBox : darkColorBox}
          >
            <ModalHeader align="center">Confirm stake</ModalHeader>
            {!staking ? <ModalCloseButton /> : null}
            <ModalBody>
              {staked && !failed ? (
                <Fireworks autorun={{ speed: 3, duration: 3 }} />
              ) : null}
              <ProcessTime estimate={"30 secs"} />
              <Box
                border={
                  colorMode === "light"
                    ? `solid ${lightBorderColor} 1px`
                    : `solid ${darkBorderColor} 1px`
                }
                borderRadius="md"
                p={3}
                mb={3}
              >
                <Stepper index={activeStep}>
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <VStack align="center" gap={1}>
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={
                              failed ? (
                                <WarningIcon color="red.500" />
                              ) : staking ? (
                                <Spinner size="sm" />
                              ) : (
                                <StepNumber />
                              )
                            }
                          />
                        </StepIndicator>
                        <StepDescription>{step.description}</StepDescription>
                      </VStack>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
              </Box>
              <VStack align="start" p={3} gap={3}>
                <InfoRow
                  title={"Stake amount"}
                  stat={`${Number(amount).toFixed(4)} ICP`}
                />
                <Divider />
                <InfoRow
                  title={"Network fee"}
                  stat={`${e8sToIcp(networkFeeE8s * 2).toFixed(4)} ICP`}
                />
                <Divider />
                <Box w="100%" color="green.500">
                  <InfoRow
                    title={"Amount after fee"}
                    stat={`${e8sToIcp(
                      Number(
                        icpToE8s(Number(amount)) - BigInt(networkFeeE8s * 2)
                      )
                    ).toFixed(4)} ICP`}
                  />
                </Box>
                <Divider />
                <Box w="100%" color="green.500">
                  <InfoRow
                    title={"Winning chance"}
                    stat={
                      staked && !failed
                        ? "Updated"
                        : getWinningChanceIncrease(
                            neuronpool_balance,
                            amount,
                            total_stake_deposits
                          )
                    }
                  />
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button
                rounded="full"
                boxShadow="base"
                w="100%"
                colorScheme="blue"
                isLoading={staking}
                onClick={staked ? closeModal : stake}
              >
                {!staked ? "Confirm stake" : null}
                {staked && !failed ? "Asset staked" : null}
                {staked && failed ? "Staking failed" : null}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal> */}
        </>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default Create;
