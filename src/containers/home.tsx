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
  const [buttonText, setButtonText] = useState("Mint for 0 ETH");
  const [mintText, setMintText] = useState("");
  const [whitelistManager, setWhitelistManager] =
    useState<WhitelistManagement>();
  const [details, setDetails] = useState<{
    maxPurchase: number;
    maxTokens: number;
  }>({
    maxPurchase: 0,
    maxTokens: 0,
  });
  const [polledDetails, setPolledDetails] = useState<{
    price?: BigNumber;
    presale?: boolean;
  }>({
    presale: false,
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
      const proof = whitelistManager?.getProof(user);
      const isWhitelisted = await contract.callStatic.isWhitelisted(
        proof,
        user
      );
      if (!isWhitelisted) {
        setButtonText(BUTTON_TEXT.PRESALE_NOT_ALLOWED);
        setDisabledMintButton(true);
        setDisabledMintInput(true);
      }
      return isWhitelisted;
    } else {
      const proof = whitelistManager?.getProof(user);
      const isWhitelisted = await contract.callStatic.isWhitelisted(
        proof,
        user
      );

      if (!isWhitelisted) {
        setButtonText(BUTTON_TEXT.PRESALE_NOT_ALLOWED);
        setDisabledMintButton(true);
        setDisabledMintInput(true);
      }
      return isWhitelisted;
    }
  };

  useEffect(() => {
    if (
      mintText.includes(BUTTON_TEXT.MINT_PRESALE) ||
      mintText.includes(BUTTON_TEXT.MINT_SALE)
    ) {
      if (!noSale) {
        if (
          buttonText !== BUTTON_TEXT.TRANSACTION &&
          buttonText !== BUTTON_TEXT.MINTING &&
          buttonText !== BUTTON_TEXT.PRESALE_NOT_ALLOWED
        ) {
          setButtonText(mintText);
        }
      } else {
        if (tokenCount.toString() === details.maxTokens.toString()) {
          setButtonText(BUTTON_TEXT.SOLD_OUT);
        } else setButtonText(BUTTON_TEXT.NO_SALE);
      }
    }
  }, [mintText, tokenCount, details.maxTokens, noSale]);

  useEffect(() => {
    if (tokenCount.toString() === details.maxTokens.toString()) {
      setButtonText(BUTTON_TEXT.SOLD_OUT);
    }
  }, [tokenCount, details.maxTokens]);

  const resetMint = () => {
    setButtonText(mintText);
    setDisabledMintInput(false);
    setNoOfTokens("");
  };

  const presaleBuy = async (quantity: number) => {
    if (await checkWhitelisted()) {
      const proof = whitelistManager?.getProof(user);
      try {
        const transaction = await contract
          .connect(signer)
          ?.presaleBuy(proof, user, quantity);
        return { tx: transaction, error: false };
      } catch (error) {
        console.log({ error });
      }
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
          setButtonText(mintText);
        } else {
          setDisabledMintButton(true);
          setButtonText(BUTTON_TEXT.EXCEEDS);
        }
      } else {
        setDisabledMintButton(true);
        setButtonText(mintText);
      }
    } else {
      setDisabledMintButton(true);
      setButtonText(mintText);
    }
  }, [noOfTokens]);

  useEffect(() => {
    if (user) {
      setConnected(true);
    }

    if (user && polledDetails.presale) {
      checkWhitelisted().then((isWhitelisted) => {
        if (isWhitelisted) {
          resetMint();
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && contract && polledDetails.presale) {
      checkWhitelisted().then((isWhitelisted) => {
        if (isWhitelisted) {
          resetMint();
        }
      });
    }
  }, [user, contract]);

  useEffect(() => {
    if (details.maxPurchase > 0) {
      setLoaded(true);
    }
  }, [details]);

  useEffect(() => {
    const updateSaleState = async () => {
      const { maxPurchase, maxTokens } = details;
      const { presale } = polledDetails;
      const detailsObj = details;
      if (presale) {
        const presaleMaxHolding = await contract.callStatic.presaleMaxHolding();
        detailsObj.maxPurchase =
          presaleMaxHolding < maxPurchase ? presaleMaxHolding : maxPurchase;
      }
      const price = await contract.callStatic[
        presale ? "presalePrice()" : "price()"
      ]();
      setPolledDetails({ ...polledDetails, price });
      setMintText(
        presale
          ? BUTTON_TEXT.MINT_PRESALE
          : `${BUTTON_TEXT.MINT_SALE} ${ethers.utils.formatUnits(price)} ETH`
      );
    };
    if (contract) {
      checkWhitelisted();
      updateSaleState();
    }
  }, [polledDetails.presale]);

  useEffect(() => {
    if (noSale) {
      if (tokenCount.toString() === details.maxTokens.toString()) {
        setButtonText(BUTTON_TEXT.SOLD_OUT);
      } else setButtonText(BUTTON_TEXT.NO_SALE);
    }
  }, [noSale, details.maxTokens, tokenCount]);

  useEffect(() => {
    let interval;

    if (contract) {
      const getPolledDetails = async () => {
        try {
          const tokenCounter = await contract.callStatic.totalSupply();
          const isPresaleActive = await contract.callStatic.isPresaleActive();
          const isSaleActive = await contract.callStatic.isSaleActive();
          const presale = isPresaleActive && !isSaleActive;
          setNoSale(!isSaleActive && !isPresaleActive);
          setPolledDetails({ ...polledDetails, presale });
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
          const isPresaleActive = await contract.callStatic.isPresaleActive();
          const isSaleActive = await contract.callStatic.isSaleActive();
          const presale = isPresaleActive && !isSaleActive;
          const detailsObj = {
            ...details,
            maxTokens,
            maxPurchase,
          };
          if (presale) {
            detailsObj.maxPurchase =
              presaleMaxHolding < maxPurchase ? presaleMaxHolding : maxPurchase;
          }
          const price = await contract.callStatic[
            presale ? "presalePrice()" : "price()"
          ]();
          setMintText(
            presale
              ? BUTTON_TEXT.MINT_PRESALE
              : `${BUTTON_TEXT.MINT_SALE} ${ethers.utils.formatUnits(
                  price
                )} ETH`
          );
          setDetails({ ...detailsObj });
          setPolledDetails({ ...polledDetails, price, presale });
        } catch (err) {
          console.log({ err });
        }
      };

      if (provider?.connection?.url === "metamask" && !noSale) {
        getDetails();
        getPolledDetails();
        interval = setInterval(() => {
          getPolledDetails();
        }, 5000);
      } else if (noSale) {
        getDetails();
        getPolledDetails();
        interval = setInterval(() => {
          getPolledDetails();
        }, 1000);
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [contract, provider, noSale]);

  const mintHandler = async (e: any) => {
    e.preventDefault();
    setButtonText(BUTTON_TEXT.TRANSACTION);
    setDisabledMintButton(true);
    setDisabledMintInput(true);
    try {
      let transaction;
      if (polledDetails?.presale) {
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
        const price = await contract.callStatic.price();
        transaction = await contract
          ?.connect(signer)
          ?.buy(user, parseInt(noOfTokens), {
            value: BigNumber.from(noOfTokens).mul(price),
          });
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
            alt="hero gif"
            src="/blockapelads.gif"
            layout="fill"
            className="hero-gif"
            quality="10"
          />
        </div>
        <h1 id="hero-text">Block Ape Lads</h1>
        {connected ? (
          <h3 id="counter">{`Tokens Claimed: ${
            tokenCount >= 0 && details?.maxTokens
              ? polledDetails?.presale ? `${tokenCount}/2000` : `${tokenCount}/${details.maxTokens}`
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
