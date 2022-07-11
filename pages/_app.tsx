import "../styles/globals.css";
import "../styles/Home.scss";
import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import Toaster from "../src/components/Toaster";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Toaster />
      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
