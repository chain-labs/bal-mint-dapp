import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useWallet = (): any => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>(
    // @ts-ignore
    ethers.getDefaultProvider("rinkeby")
  );
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
      provider.getNetwork().then((network) => {
        const networkId = network.chainId;
        console.log({ networkId });

        if (networkId !== 4) {
          console.log({ networkId });

          // @ts-ignore
          window.ethereum
            .request({
              method: "wallet_switchEthereumChain",
              params: [
                {
                  chainId: "0x4",
                },
              ],
            })
            .then(() => {
              provider.getNetwork().then((network) => {
                console.log({ network });
              });
            });
        }
      });
      const signer = provider?.getSigner();
      setSigner(signer);
    }
  }, [provider]);

  useEffect(() => {
    signer?.getAddress().then((user) => {
      console.log({ user });

      setUser(user);
    });
  }, [signer]);

  const connectWallet = () => {
    if (typeof window !== "undefined") {
      const getProvider = async () => {
        const provider = await new ethers.providers.Web3Provider(
          // @ts-expect-error ethereum in window is not defined
          window.ethereum,
          "any"
        );
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
