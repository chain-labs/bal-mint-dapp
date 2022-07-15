/* eslint-disable @next/next/no-img-element */
import { TwitterFill } from "akar-icons";
import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DiscordFill from "../components/svgs/discord";
import { CONTRACT_ADDRESS, getEtherscanUrl } from "../constants";
import useContract from "../hooks/useContract";
import useWallet from "../hooks/useWallet";
import EtherscanIcon from "../../public/etherscan.svg";

import axios from "axios";
import WhitelistManagement from "../WhitelistManager";

const condense = (text: string) => {
  return `${text?.substring(0, 5)}...${text?.substring(text.length - 5)}`;
};

const BUTTON_TEXT = {
  MINT_PRESALE: "Mint for Free",
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

  const [contract] = useContract(CONTRACT_ADDRESS, provider);

  const resetMint = () => {
    setButtonText(BUTTON_TEXT.MINT_PRESALE);
    setDisabledMintInput(false);
    setNoOfTokens("");
  };

  //   useEffect(() => {
  //     if (noOfTokens) {
  //       const tokensCount = parseInt(noOfTokens);

  //       if (tokensCount > 0) {
  //         if (tokensCount <= details?.maxPurchase) {
  //           setDisabledMintButton(false);

  //           setButtonText(BUTTON_TEXT.MINT_PRESALE);
  //         } else {
  //           setDisabledMintButton(true);
  //           setButtonText(BUTTON_TEXT.EXCEEDS);
  //         }
  //       } else {
  //         setDisabledMintButton(true);

  //         setButtonText(BUTTON_TEXT.MINT_PRESALE);
  //       }
  //     } else {
  //       setDisabledMintButton(true);

  //       setButtonText(BUTTON_TEXT.MINT_PRESALE);
  //     }
  //   }, [noOfTokens]);

  useEffect(() => {
    if (user) {
      setConnected(true);
    }
  }, [user]);

  //   const mintHandler = async (e: any) => {
  //     e.preventDefault();
  //     setButtonText(BUTTON_TEXT.TRANSACTION);
  //     setDisabledMintButton(true);
  //     setDisabledMintInput(true);
  //     try {
  //       let transaction;
  //       if (polledDetails?.presale) {
  //         const { tx, error } = await presaleBuy(parseInt(noOfTokens));
  //         if (error) {
  //           toast(`Whoops! Looks like you are not whitelisted.`);
  //           resetMint();
  //           return;
  //         } else {
  //           transaction = tx;
  //           setButtonText(BUTTON_TEXT.MINTING);
  //         }
  //       } else {
  //         const price = await contract.callStatic.price();
  //         transaction = await contract
  //           ?.connect(signer)
  //           ?.buy(user, parseInt(noOfTokens), {
  //             value: BigNumber.from(noOfTokens).mul(price),
  //           });
  //         setButtonText(BUTTON_TEXT.MINTING);
  //       }
  //       const event = transaction
  //         .wait()
  //         .then((tx: any) => {
  //           resetMint();
  //           toast(
  //             `🎉 Succesfully minted ${noOfTokens} Block Ape Lads!//${tx.transactionHash}`
  //           );
  //         })
  //         .catch((err: any, tx: any) => {
  //           resetMint();
  //           toast(`❌ Something went wrong! Please Try Again`);
  //         });
  //     } catch (err) {
  //       console.error(err);
  //       resetMint();
  //       if (err.message.includes("PR:012")) {
  //         toast(`You cannot own more than ${details.maxPurchase} tokens`);
  //       } else if (err.message.includes("insufficient funds")) {
  //         toast(`You do not have enough funds to purchase this token`);
  //       } else toast(`❌ Something went wrong! Please Try Again`);
  //     }
  //   };

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
          />
        </div>
        <h1 id="hero-text">Block Ape Lads</h1>
        {connected ? (
          <h3 id="counter">{`Tokens Claimed: Counting...`}</h3>
        ) : null}
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
              parseInt(tokenCount) < details?.maxTokens && loaded && !noSale ? (
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
            {loaded ? (
              <button
                className="mint-btn"
                onClick={mintHandler}
                disabled={disabledMintButton}
                style={
                  noSale ? { paddingLeft: "24px", paddingRight: "24px" } : null
                }
              >
                {buttonText}
              </button>
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
