import IcLogo from "../../assets/ic-logo.png";
import NtnLogo from "../../assets/ntn-logo.png";
import SneedLogo from "../../assets/sneed-logo.png";

interface TokenIcon {
  src: string;
  symbol: string;
}

export const tokensIcons: TokenIcon[] = [
  {
    src: NtnLogo,
    symbol: "NTN",
  },
  {
    src: IcLogo,
    symbol: "ICP",
  },
  {
    src: SneedLogo,
    symbol: "SNEED",
  },
];
