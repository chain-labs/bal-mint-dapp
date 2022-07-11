import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import HomeContainer from "../src/containers/home";

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Block Ape Lads | Mint Here</title>
      </Head>
      <HomeContainer />
    </React.Fragment>
  );
};

export default Home;
