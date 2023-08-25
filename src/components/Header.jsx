import React from "react";
import { GoSearch } from "react-icons/go";
import { useVent } from "../Context";

export default function Header() {
  const {
    setConnectModal,
    currentAccount,
    shortenAddress,
    transactionStatus,
    transaction,
  } = useVent();

  return (
    <header>
      <div className="header--1">
        <input
          type="text"
          placeholder="Search by vent name, address"
          onClick={async () => {
            await transactionStatus(transaction);
            // console.log("Header")
          }}
        />
        <button>
          <GoSearch />
        </button>
      </div>

      <div className="header--2">
        {currentAccount ? (
          <div
            className="flex-row align-center"
            style={{
              border: "1px solid rgba(0, 0, 0, .1)",
              borderRadius: "50px",
              padding: ".1rem .5rem",
            }}
          >
            <div
              className="dot"
              style={{ backgroundColor: "aqua", marginRight: ".3rem" }}
            ></div>
            <h3 style={{ fontWeight: "400" }}>
              {shortenAddress(currentAccount, 17)}
            </h3>
          </div>
        ) : (
          <button
            className="btn btn--primary btn--connect"
            onClick={() => setConnectModal(true)}
          >
            connect
            <img className="btn--connect-icon" src="metamask.svg" />
          </button>
        )}
      </div>
    </header>
  );
}
