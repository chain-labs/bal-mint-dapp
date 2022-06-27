import { TwitterFill } from "akar-icons";
import { BigNumber } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DiscordFill from "../components/svgs/discord";
import { CONTRACT_ADDRESS, SALE_TYPE } from "../constants";
import useContract from "../hooks/useContract";
import useWallet from "../hooks/useWallet";

import axios from "axios";
import WhitelistManagement from "../WhitelistManager";

const condense = (text: string) => {
  return `${text.substring(0, 5)}...${text.substring(text.length - 5)}`;
};

const BUTTON_TEXT = {
  MINT: "Mint for Free",
  EXCEEDS: "Token exceeds limit",
  TRANSACTION: "Confirm Transaction",
  MINTING: "Minting...",
  SOLD_OUT: "Sold Out",
  PRESALE_NOT_ALLOWED: "Not Allowed to Buy",
};

const HomeContainer = () => {
  const [connected, setConnected] = useState(false);
  const [user, provider, signer, connectWallet] = useWallet();
  const [noOfTokens, setNoOfTokens] = useState<string>("");
  const [disabledMintButton, setDisabledMintButton] = useState(true);
  const [disabledMintInput, setDisabledMintInput] = useState(false);
  const [buttonText, setButtonText] = useState("Mint for 0 ETH");
  const [whitelistManager, setWhitelistManager] =
    useState<WhitelistManagement>();
  const [details, setDetails] = useState<{
    maxPurchase: number;
    maxTokens: number;
    price?: BigNumber;
  }>({
    maxPurchase: 0,
    maxTokens: 0,
  });

  const [tokenCount, setTokenCount] = useState<number>(-1);

  const [contract] = useContract(CONTRACT_ADDRESS, provider);

  const checkWhitelisted = async () => {
    if (!whitelistManager) {
      const whitelistCid = await contract?.callStatic.whitelistCid();
      const whitelist = (
        await axios.get(`https://simplr.mypinata.cloud/ipfs/${whitelistCid}`)
      )?.data?.addresses;
      const whitelistManager = new WhitelistManagement(whitelist);
      setWhitelistManager(whitelistManager);
      const proof = whitelistManager.getProof(user);
      const isWhitelisted = await contract.callStatic.isWhitelisted(
        proof,
        user
      );
      if (!isWhitelisted) {
        setButtonText(BUTTON_TEXT.PRESALE_NOT_ALLOWED);
        setDisabledMintButton(true);
        setDisabledMintInput(true);
      } else {
        resetMint();
      }
      return isWhitelisted;
    } else {
      const proof = whitelistManager.getProof(user);
      const isWhitelisted = await contract.callStatic.isWhitelisted(
        proof,
        user
      );
      if (!isWhitelisted) {
        setButtonText(BUTTON_TEXT.PRESALE_NOT_ALLOWED);
        setDisabledMintButton(true);
        setDisabledMintInput(true);
      } else {
        resetMint();
      }
      return isWhitelisted;
    }
  };

  const resetMint = () => {
    setButtonText(BUTTON_TEXT.MINT);
    setDisabledMintInput(false);
    setNoOfTokens("");
  };

  const presaleBuy = async (quantity: number) => {
    if (await checkWhitelisted()) {
      const proof = whitelistManager.getProof(user);
      const transaction = await contract
        .connect(signer)
        ?.presaleBuy(proof, user, quantity);
      return { tx: transaction, error: false };
    } else {
      return { tx: {}, error: true };
    }
  };

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
      checkWhitelisted();
    }
  }, [user]);

  useEffect(() => {
    if (user && contract) {
      checkWhitelisted();
    }
  }, [user, contract]);

  useEffect(() => {
    if (contract) {
      const getPolledDetails = async () => {
        try {
          const tokenCounter = await contract.callStatic.totalSupply();
          setTokenCount(tokenCounter);
          if (tokenCounter === details?.maxTokens) {
            setButtonText(BUTTON_TEXT.SOLD_OUT);
            setDisabledMintButton(true);
          }
        } catch (err) {
          console.log({ err });
        }
      };

      const getDetails = async () => {
        try {
          const maxTokens = await contract.callStatic.maximumTokens();
          const maxPurchase = await contract.callStatic.maxPurchase();
          const presaleMaxHolding =
            await contract.callStatic.presaleMaxHolding();
          const detailsObj = {
            ...details,
            maxTokens,
            maxPurchase,
            price: null,
          };
          if (SALE_TYPE === "presale") {
            detailsObj.maxPurchase =
              presaleMaxHolding < maxPurchase ? presaleMaxHolding : maxPurchase;
          }
          const price = await contract.callStatic[
            SALE_TYPE === "presale" ? "presalePrice()" : "price()"
          ]();
          setDetails({ ...detailsObj, price });
        } catch (err) {
          console.log({ err });
        }
      };

      if (provider?.connection?.url === "metamask") {
        getDetails();
        getPolledDetails();
        setInterval(() => {
          getPolledDetails();
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
      let transaction;

      if (SALE_TYPE === "presale") {
        const { tx, error } = await presaleBuy(parseInt(noOfTokens));
        if (error) {
          toast(`Whoops! Looks like you are not whitelisted.`);
          resetMint();
          return;
        } else {
          transaction = tx;
          setButtonText(BUTTON_TEXT.MINTING);
        }
      } else {
        transaction = await contract
          ?.connect(signer)
          ?.buy(user, parseInt(noOfTokens));
        setButtonText(BUTTON_TEXT.MINTING);
      }
      const event = transaction
        .wait()
        .then((tx: any) => {
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
      console.error(err);
      resetMint();
      if (err.message.includes("PR:012")) {
        toast(`You cannot own more than ${details.maxPurchase} tokens`);
      } else toast(`❌ Something went wrong! Please Try Again`);
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <div>
          <a href="https://blockapelads.com" rel="noreferrer">
            <Image src="/logo.svg" alt="logo" width={328} height={50} />
          </a>
        </div>
        <div className="flex-row icon-box">
          <a
            href="https://twitter.com/Blockapelads"
            target="_blank"
            rel="noreferrer"
          >
            <TwitterFill color="#fff" size={48} />
          </a>
          <a
            href="https://discord.gg/j7FYsDqkr3"
            target="_blank"
            rel="noreferrer"
          >
            <DiscordFill color="#fff" size="48" />
          </a>
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
        {connected ? (
          <h3 id="counter">{`Tokens Claimed: ${
            tokenCount >= 0 && details?.maxTokens
              ? `${tokenCount}/${details.maxTokens}`
              : "Counting..."
          }`}</h3>
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
              parseInt(tokenCount) < details?.maxTokens ? (
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
