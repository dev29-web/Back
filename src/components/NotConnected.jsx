import React from "react";
import { useVent } from "../Context";

export default function NotConnected() {
  const { setConnectModal } = useVent();

  return (
    <>
      <h4>Contract not found</h4>
      <h6 style={{ fontWeight: "300", marginBottom: "0px" }}>
        Connect to Metamask Wallet
      </h6>
      <button
        className="btn btn--primary"
        onClick={() => setConnectModal(true)}
      >
        Connect
      </button>
    </>
  );
}
