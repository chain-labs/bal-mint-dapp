export const boolify = (x: string) => {
  if (x.toLowerCase() === "true") return true;
  else return false;
};

export const CONTRACT_ADDRESS = `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`;

export const NETWORK: string = boolify(
  `${process.env.NEXT_PUBLIC_TEST_NETWORK}`
)
  ? "rinkeby"
  : "mainnet";

export const CHAIN_ID: string = boolify(
  `${process.env.NEXT_PUBLIC_TEST_NETWORK}`
)
  ? "4"
  : "1";

export const getEtherscanUrl = () => {
  if (NETWORK === "rinkeby") {
    return `https://rinkeby.etherscan.io/address/${CONTRACT_ADDRESS}`;
  } else {
    return `https://etherscan.io/address/${CONTRACT_ADDRESS}`;
  }
};

export const SALE_PAUSED = process.env.NEXT_PUBLIC_SALE_PAUSED === "true";
export const MAX_TOKENS = `${process.env.NEXT_PUBLIC_MAX_TOKENS}`;
