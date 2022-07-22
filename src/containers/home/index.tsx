/* eslint-disable @next/next/no-img-element */
import { TwitterFill } from "akar-icons";
import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DiscordFill from "../../components/svgs/discord";
import { CONTRACT_ADDRESS, getEtherscanUrl, MAX_TOKENS, SALE_PAUSED } from "../../constants";
import useContract from "../../hooks/useContract";
import useWallet from "../../hooks/useWallet";

const condense = (text: string) => {
  return `${text?.substring(0, 5)}...${text?.substring(text.length - 5)}`;
};

const BUTTON_TEXT = {
  MINT: "Mint for Free",
  MINT_SALE: "Mint for ",
  EXCEEDS: "Token exceeds limit",
  TRANSACTION: "Confirm Transaction",
  MINTING: "Minting...",
  SOLD_OUT: "Sold Out",
  PRESALE_NOT_ALLOWED: "Not Allowed to Buy",
  NO_SALE: "Coming Soon, Stay Tuned",
};

const HomeContainer = () => {
  const [connected, setConnected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [user, provider, signer, connectWallet] = useWallet();
  const [noOfTokens, setNoOfTokens] = useState<string>("");
  const [noSale, setNoSale] = useState(false);
  const [disabledMintButton, setDisabledMintButton] = useState(true);
  const [disabledMintInput, setDisabledMintInput] = useState(false);
  const [buttonText, setButtonText] = useState("Mint for Free");

  const [newSupply, setNewSupply] = useState<number>();

  const [contract] = useContract(CONTRACT_ADDRESS, provider);

  const [maxPurchase, setMaxPurchase] = useState<number>();
  // const [tokens, setTokens] = useState({
  //   totalLimit: null,
  //   usedLimit: null,
  //   totalSupply: null,
  // });

  const [tokenCount, setTokenCount] = useState<number>();

  const resetMint = () => {
    setButtonText(BUTTON_TEXT.MINT);
    setDisabledMintInput(false);
    setNoOfTokens("");
  };

  useEffect(() => {
    const getDetails = async () => {
      const totalSupply = parseInt(await contract.callStatic.totalSupply());
      // const usedLimit = parseInt(await contract.callStatic.usedLimit());
      // const totalLimit = parseInt(await contract.callStatic.totalLimit());

      const newTotalSupply = parseInt(await contract.callStatic.NEW_SUPPLY());
      setNewSupply(newTotalSupply);

      const tokenCount = totalSupply;
      setTokenCount(tokenCount);
    };

    if (contract && provider) {
      contract.callStatic.MAX_PURCHASE_LIMIT().then((maxPurchase) => {
        setMaxPurchase(maxPurchase);
      });
      getDetails();

      setInterval(() => {
        getDetails();
      }, 5000);
    }
  }, [contract, provider]);

  useEffect(() => {
    if (user) {
      setConnected(true);
    }
  }, [user]);

  useEffect(() => {
    if (noOfTokens) {
      const tokensCount = parseInt(noOfTokens);

      if (tokensCount > 0) {
        if (tokensCount <= maxPurchase) {
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
  }, [noOfTokens, maxPurchase]);

  const mintHandler = async (e) => {
    e.preventDefault();
    setButtonText(BUTTON_TEXT.TRANSACTION);
    setDisabledMintButton(true);
    setDisabledMintInput(true);
    try {
      const transaction = await contract
        ?.connect(signer)
        ?.buy([], user, parseInt(noOfTokens));
      setButtonText(BUTTON_TEXT.MINTING);
      const event = transaction
        .wait()
        .then((tx: any) => {
          setTokenCount(tokenCount + parseInt(noOfTokens));
          resetMint();
          toast(
            `🎉 Succesfully minted ${noOfTokens} Block Ape Lads!//${tx.transactionHash}`
          );
        })
        .catch((err: any, tx: any) => {
          resetMint();
          toast(`❌ Something went wrong! Please Try Again`);
        });
    } catch (err) {
      console.log({ err });
      if (err.message.includes("out of buying limit")) {
        toast(`❌ You have exceeded your buying limit`);
      } else {
        toast(`❌ Something went wrong! Please Try Again`);
      }
      resetMint();
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <div>
          <a href="https://blockapelads.com" rel="noreferrer">
            <div className="logo-cont">
              <Image src="/logo.svg" alt="logo" layout="fill" />
            </div>
          </a>
        </div>
        <div className="flex-row icon-box">
          <a
            href={getEtherscanUrl()}
            rel="noreferrer"
            target="_blank"
            className="icon"
          >
            <img src="/etherscan.svg" alt="etherscan" />
          </a>
          <a
            href="https://twitter.com/Blockapelads"
            target="_blank"
            rel="noreferrer"
            className="icon"
          >
            <TwitterFill color="#fff" size={48} />
          </a>
          <a
            href="https://discord.gg/j7FYsDqkr3"
            target="_blank"
            rel="noreferrer"
            className="icon"
          >
            <DiscordFill color="#fff" size="48" />
          </a>
        </div>
      </div>
      <div className="hero">
        <div className="hero-gif-container">
          <Image
            alt="hero g-smif"
            src="/blockapelads-2.gif"
            layout="fill"
            className="hero-gif"
            quality="10"
            priority
          />
        </div>
        <h1 id="hero-text">Block Ape Lads</h1>
        {connected ? (
          <h3 id="counter">{`Tokens Claimed: ${
            tokenCount ? `${tokenCount}/${newSupply}` : "Counting..."
          }`}</h3>
        ) : null}
      </div>
      <div className="mint-section">
        {!connected ? (
          <button
            className="connect-btn"
            onClick={() => {
              if (!SALE_PAUSED) connectWallet();
            }}
          >
            {SALE_PAUSED
              ? "Free Mint Coming Soon!"
              : "Connect Wallet"}
          </button>
        ) : (
          <div className="mint-container">
            {tokenCount === newSupply ? (
              <a
                href="https://opensea.io/collection/block-ape-lads-genesis"
                target="_blank"
                rel="noreferrer"
              >
                <button
                  className="mint-btn"
                  style={
                    noSale
                      ? { paddingLeft: "24px", paddingRight: "24px" }
                      : null
                  }
                >
                  Buy on OpenSea
                </button>
              </a>
            ) : maxPurchase ? (
              <React.Fragment>
                <input
                  className="mint-input"
                  type="number"
                  onWheel={(e) => {
                    // @ts-ignore
                    e.target?.blur();
                  }}
                  placeholder={`Number of Tokens. ${
                    maxPurchase ? `(Max. ${maxPurchase})` : ""
                  }`}
                  value={noOfTokens}
                  onChange={(e) => setNoOfTokens(e.target.value)}
                  min={0}
                  max={10}
                  disabled={disabledMintInput}
                />
                <button
                  className="mint-btn"
                  onClick={mintHandler}
                  disabled={disabledMintButton}
                  style={
                    noSale
                      ? { paddingLeft: "24px", paddingRight: "24px" }
                      : null
                  }
                >
                  {buttonText}
                </button>
              </React.Fragment>
            ) : null}
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
