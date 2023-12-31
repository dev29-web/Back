import React from "react";
import { useVent } from "../Context";

export default function NotConnected() {
  const { setConnectModal } = useVent();

  return (
    <>
      <h4 style={{ fontWeight: "300", fontSize: "1.1rem" }}>
        Contract Connection not found
      </h4>
      <h6
        style={{ fontWeight: "500", marginBottom: "5px", fontSize: "inherit" }}
      >
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
