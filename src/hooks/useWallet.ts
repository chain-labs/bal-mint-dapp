import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { CHAIN_ID } from "../constants";

const useWallet = (): any => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >();
  const [user, setUser] = useState<string>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      const eth = window.ethereum;

      if (eth) {
        eth.on("accountsChanged", (accounts: string[]) => {
          setUser(accounts[0]);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (provider && provider?.provider?.isMetaMask) {
      const signer = provider?.getSigner();
      setSigner(signer);
    }
  }, [provider]);

  useEffect(() => {
    try {
      signer?.getAddress().then((user) => {
        setUser(user);
      });
    } catch (error) {
      console.log({ error });
    }
  }, [signer]);

  const connectWallet = () => {
    if (typeof window !== "undefined") {
      const getProvider = async () => {
        let provider = await new ethers.providers.Web3Provider(
          // @ts-expect-error ethereum in window is not defined
          window.ethereum,
          "any"
        );
        await provider.send("eth_requestAccounts", []);
        provider.getNetwork().then(async (network) => {
          const networkId = network.chainId;
          if (networkId !== parseInt(CHAIN_ID)) {
            // @ts-ignore
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [
                {
                  chainId: `0x${CHAIN_ID}`,
                },
              ],
            });
            provider = await new ethers.providers.Web3Provider(
              // @ts-expect-error ethereum in window is not defined
              window.ethereum,
              "any"
            );
            await provider.send("eth_requestAccounts", []);

            setProvider(provider);
          }
        });
        // @ts-expect-error ethereum in window is not defined
        window.ethereum.enable();
        setProvider(provider);
      };
      getProvider();
    }
  };
  return [user, provider, signer, connectWallet];
};

export default useWallet;
