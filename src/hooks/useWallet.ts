import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CHAIN_ID, NETWORK } from "../constants";

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
    console.log({ provider });
    if (provider && provider?.provider?.isMetaMask) {
      provider.getNetwork().then((network) => {
        const networkId = network.chainId;
        if (networkId !== parseInt(CHAIN_ID)) {
          // @ts-ignore
          window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: `0x${NETWORK}`,
              },
            ],
          });
        }
      });
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

            setProvider(
              await new ethers.providers.Web3Provider(
                // @ts-expect-error ethereum in window is not defined
                window.ethereum,
                "any"
              )
            );
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
