import React from "react";
import { SkeletonText } from "@chakra-ui/react";

const LoadingBox = () => {
  return <SkeletonText noOfLines={10} spacing={4} skeletonHeight={6} />;
};

export default LoadingBox;
