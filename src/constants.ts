export const boolify = (x: string) => {
  if (x.toLowerCase() === "true") return true;
  else return false;
};

export const CONTRACT_ADDRESS = `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`;

export const SALE_TYPE = `${process.env.NEXT_PUBLIC_SALE_TYPE}`;

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
