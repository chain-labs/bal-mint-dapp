import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { CHAIN_ID, NETWORK } from "../constants";
import contracts from "../contracts.json";

const useContract = (
  address: string,
  provider: ethers.providers.Web3Provider
) => {
  const [contract, setContract] = useState<ethers.Contract>();

  useEffect(() => {
    if (provider) {
      // @ts-ignore
      const abi = contracts?.[CHAIN_ID]?.[NETWORK]?.contracts?.BALMigration?.abi;
      const contract = new ethers.Contract(address, abi, provider);
      setContract(contract);
    }
  }, [provider]);

  return [contract];
};

export default useContract;
