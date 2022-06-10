import { TwitterFill } from "akar-icons";
import Image from "next/image";
import DiscordFill from "../components/svgs/discord";

const HomeContainer = () => {
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
        <button className="connect-btn">Connect Wallet</button>
      </div>
      <div>
        <Image
          className="smokescreen"
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
  );
};

export default HomeContainer;
