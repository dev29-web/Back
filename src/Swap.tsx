import React, { useEffect } from "react";

import { ethers } from "ethers";
import { Squid, TokenData } from "@0xsquid/sdk";

import { useVent } from "./Context";

const squid = new Squid({
  baseUrl: "https://testnet.api.squidrouter.com",
});

export default function Swap({}) {
  const { setSwapFunction } = useVent();
  interface chainOptions {
    name: string;
    native: string;
    chainId: Number;
    address: string;
  }

  useEffect(() => {
    console.log("swap start");
    if (!setSwapFunction) return;
    console.log("swap started");

    setSwapFunction(() => swap);
    // if (signer && swapForm) {
    //   swap(
    //     swapForm.fromCoin,
    //     swapForm.fromNetwork,
    //     swapForm.amount,
    //     signer,
    //     swapForm.source,
    //     swapForm.destination
    //   ).then((res) => {
    //     console.log("swap res", res);
    //     setTransaction(res.transactionHash);
    //   });
    // }
  }, [setSwapFunction]);

  function capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function swap(
    fromCoin: string,
    fromNetwork: string,
    amount: string,
    source: chainOptions,
    destination: chainOptions,
    signer: any
  ) {
    await squid.init();
    const fromToken = squid.tokens.find(
      //finding
      (token) =>
        token.symbol === fromCoin &&
        token.chainId ===
          squid.chains.find((c) => c.chainName === capitalize(fromNetwork))
            ?.chainId
    );
    const toToken = squid.tokens.find(
      //finding
      (token) =>
        token.symbol === destination.native &&
        token.chainId ===
          squid.chains.find((c) => c.chainName === capitalize(destination.name))
            ?.chainId
    );

    const myAddress = await signer?.getAddress();
    console.log("swap Add", myAddress);
    const amount_wei = ethers.utils.parseEther(amount);
    try {
      const { route } = await squid.getRoute({
        toAddress: destination?.address,
        fromChain: fromToken?.chainId as string,
        fromToken: fromToken?.address as string,
        fromAmount: amount_wei.toString(),
        toChain: toToken?.chainId as string,
        toToken: toToken?.address as string,
        slippage: 0.5,
      });
      console.log("swap ed", route);

      const isApproved = await squid.approveRoute({ signer, route });
      console.log("swap", isApproved, route.estimate.toAmount);

      let tx: any;
      if (isApproved) {
        tx = await (
          await squid.executeRoute({
            signer,
            route,
          })
        ).wait();
      }
      return tx;
    } catch (e) {
      console.error("swap", e);
      return false;
    }
  }
  return false;
}
