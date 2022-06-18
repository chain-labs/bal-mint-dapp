import { TwitterFill } from "akar-icons";
import { BigNumber } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
  SOLD_OUT: "Sold Out",
};

const HomeContainer = () => {
  const [connected, setConnected] = useState(false);
  const [user, provider, signer, connectWallet] = useWallet();
  const [noOfTokens, setNoOfTokens] = useState<string>("");
  const [disabledMintButton, setDisabledMintButton] = useState(true);
  const [disabledMintInput, setDisabledMintInput] = useState(false);
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
        if (tokenCounter === maxTokens) {
          setButtonText(BUTTON_TEXT.SOLD_OUT);
          setDisabledMintButton(true);
        }
      };
      getDetails();
      if (provider?.connection?.url === "metamask") {
        setInterval(() => {
          getDetails();
        }, 10000);
      }
    }
  }, [contract, provider]);

  const mintHandler = async (e: any) => {
    e.preventDefault();
    setButtonText(BUTTON_TEXT.TRANSACTION);
    setDisabledMintButton(true);
    setDisabledMintInput(true);
    try {
      const transaction = await contract
        ?.connect(signer)
        ?.buy(user, parseInt(noOfTokens));
      setButtonText(BUTTON_TEXT.MINTING);
      const event = transaction
        .wait()
        .then((tx: any) => {
          setButtonText(BUTTON_TEXT.MINT);
          setDisabledMintButton(false);
          setDisabledMintInput(false);
          setNoOfTokens("");
          toast(
            `🎉 Succesfully minted ${noOfTokens} Block Ape Lads!//${tx.transactionHash}`
          );
        })
        .catch((err: any, tx: any) => {
          setButtonText(BUTTON_TEXT.MINT);
          setDisabledMintButton(false);
          setDisabledMintInput(false);
          setNoOfTokens("");
          toast(`❌ Something went wrong! Please Try Again`);
        });
    } catch (err) {
      console.error(err);
      setButtonText(BUTTON_TEXT.MINT);
      setDisabledMintButton(false);
      setDisabledMintInput(false);
      setNoOfTokens("");
      toast(`❌ Something went wrong! Please Try Again`);
    }
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
            : "Counting..."
        }`}</h3>
      </div>
      <div className="mint-section">
        {!connected ? (
          <button className="connect-btn" onClick={() => connectWallet()}>
            Connect Wallet
          </button>
        ) : (
          <div className="mint-container">
            {
              // @ts-ignore
              details?.tokenCounter < details?.maxTokens ? (
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
                  disabled={disabledMintInput}
                />
              ) : null
            }
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
      <div className="simplr">
        <a href="https://simplrcollection.com" target="_blank" rel="noreferrer">
          <Image
            src="/simplr_brand.svg"
            height={41}
            width={167}
            alt="simplr brand"
          />
        </a>
      </div>
    </div>
  );
};

export default HomeContainer;
