import { TwitterFill } from "akar-icons";
import { BigNumber } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import DiscordFill from "../components/svgs/discord";
import { CONTRACT_ADDRESS } from "../constants";
import useContract from "../hooks/useContract";
import useWallet from "../hooks/useWallet";

const condense = (text: string) => {
  return `${text.substring(0, 5)}...${text.substring(text.length - 5)}`;
};

const BUTTON_TEXT = {
  MINT: "Mint",
  EXCEEDS: "Token exceeds limit",
  TRANSACTION: "Confirm Transaction",
  MINTING: "Minting...",
};

const HomeContainer = () => {
  const [connected, setConnected] = useState(false);
  const [user, provider, signer, connectWallet] = useWallet();
  const [noOfTokens, setNoOfTokens] = useState<string>("");
  const [disabledMintButton, setDisabledMintButton] = useState(true);
  const [buttonText, setButtonText] = useState("Mint for 0 ETH");
  const [details, setDetails] = useState<{
    maxPurchase: number;
    maxTokens?: number;
    tokenCounter?: number;
  }>({ maxPurchase: 0, maxTokens: 0, tokenCounter: 0 });

  const [contract] = useContract(CONTRACT_ADDRESS, provider);

  useEffect(() => {
    if (noOfTokens) {
      const tokensCount = parseInt(noOfTokens);

      if (tokensCount > 0) {
        if (tokensCount <= details?.maxPurchase) {
          setDisabledMintButton(false);
          setButtonText(BUTTON_TEXT.MINT);
        } else {
          setDisabledMintButton(true);
          setButtonText(BUTTON_TEXT.EXCEEDS);
        }
      } else {
        setDisabledMintButton(true);
        setButtonText(BUTTON_TEXT.MINT);
      }
    } else {
      setDisabledMintButton(true);
      setButtonText(BUTTON_TEXT.MINT);
    }
  }, [noOfTokens]);

  useEffect(() => {
    if (user) {
      setConnected(true);
    }
  }, [user]);

  useEffect(() => {
    if (contract) {
      const getDetails = async () => {
        const maxTokens = await contract.callStatic.maximumTokens();
        const maxPurchase = await contract.callStatic.maxPurchase();
        const tokenCounter = await contract.callStatic.totalSupply();
        setDetails({ maxTokens, maxPurchase, tokenCounter });
      };
      getDetails();
      if (provider?.connection?.url === "metamask") {
        setInterval(() => {
          getDetails();
        }, 3000);
      }
    }
  }, [contract, provider]);

  const mintHandler = async (e: any) => {
    e.preventDefault();
    setButtonText(BUTTON_TEXT.TRANSACTION);
    setDisabledMintButton(true);
    const transaction = await contract
      ?.connect(signer)
      ?.buy(user, parseInt(noOfTokens));
    setButtonText(BUTTON_TEXT.MINTING);
    const event = transaction.wait().then((tx: any) => {
      setButtonText(BUTTON_TEXT.MINT);
      setDisabledMintButton(false);
      setNoOfTokens("");
    });
  };

  return (
    <div className="container">
      <div className="navbar">
        <div>
          <Image src="/logo.svg" alt="logo" width={328} height={50} />
        </div>
        <div className="flex-row icon-box">
          <TwitterFill color="#fff" size={48} />
          <DiscordFill color="#fff" size="48" />
        </div>
      </div>
      <div className="hero">
        <Image
          alt="hero gif"
          src="/blockapelads.gif"
          height={300}
          width={300}
          className="hero-gif"
        />
        <h1 id="hero-text">Block Ape Lads</h1>
        <h3 id="counter">{`Tokens Claimed: ${
          details?.tokenCounter
            ? `${details.tokenCounter}/${details.maxTokens}`
            : "Fetching..."
        }`}</h3>
      </div>
      <div className="mint-section">
        {!connected ? (
          <button className="connect-btn" onClick={() => connectWallet()}>
            Connect Wallet
          </button>
        ) : (
          <div className="mint-container">
            <input
              className="mint-input"
              type="number"
              onWheel={(e) => {
                // @ts-ignore
                e.target?.blur();
              }}
              placeholder={`Number of Tokens. (Max ${details?.maxPurchase})`}
              value={noOfTokens}
              onChange={(e) => setNoOfTokens(e.target.value)}
              min={0}
              max={details?.maxPurchase}
            />
            <button
              className="mint-btn"
              onClick={mintHandler}
              disabled={disabledMintButton}
            >
              {buttonText}
            </button>
            <h3 className="user-address">
              Connected to: <span>{condense(user)}</span>
            </h3>
          </div>
        )}
      </div>
      <div
        className={`center simplr-${connected ? "connected" : "disconnected"}`}
      >
        <Image
          src="/simplr_brand.svg"
          height={28}
          width={212}
          alt="simplr brand"
        />
      </div>
    </div>
  );
};

export default HomeContainer;
