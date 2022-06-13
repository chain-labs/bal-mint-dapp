import { TwitterFill } from "akar-icons";
import Image from "next/image";
import { useState } from "react";
import DiscordFill from "../components/svgs/discord";

const HomeContainer = () => {
  const [connected, setConnected] = useState(false);
  const [noOfTokens, setNoOfTokens] = useState<number>();
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
      </div>
      <div className="mint-section">
        {!connected ? (
          <button className="connect-btn" onClick={() => setConnected(true)}>
            Connect Wallet
          </button>
        ) : (
          <div className="mint-container">
            <input
              className="mint-input"
              type="number"
              onWheel={(e) => {
                e.target?.blur();
              }}
              placeholder="Number of Tokens. eg. 2"
              value={noOfTokens}
              onChange={(e) => setNoOfTokens(parseInt(e.target.value))}
            />
            <button className="mint-btn" onClick={() => setConnected(true)}>
              Mint for 0 ETH
            </button>
            <h3 className="user-address">
              Connected to: <span>0xfE...D777</span>
            </h3>
          </div>
        )}
      </div>
      <div style={{ position: "fixed", bottom: 0, zIndex: 0 }}>
        <div className="smokescreen">
          <Image
            onDragStart={(e) => {
              e.preventDefault();
              return false;
            }}
            alt="smoke screen"
            src="/smoke.png"
            layout="fill"
            objectFit="contain"
            objectPosition="bottom"
          />
        </div>
      </div>
      <div
        className={`center simplr-${connected ? "connected" : "disconnected"}`}
        style={{}}
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
