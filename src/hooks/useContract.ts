import { ethers } from "ethers";
import { useEffect, useState } from "react";
import contracts from "../contracts.json";

const useContract = (
  address: string,
  provider: ethers.providers.Web3Provider
) => {
  const [contract, setContract] = useState<ethers.Contract>();

  useEffect(() => {
    if (provider) {
      const abi = contracts[4].rinkeby.contracts.CollectionA.abi;
      const contract = new ethers.Contract(address, abi, provider);
      setContract(contract);
    }
  }, [provider]);

  return [contract];
};

export default useContract;
