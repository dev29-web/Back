import React, { useState, useEffect } from "react";
import DotLoader from "react-spinners/DotLoader";
import { Button, Empty, Select } from "antd";

import Card from "../components/home/Card";
import NotConnected from "../components/NotConnected";

import { useVent } from "../Context";
import VentDB from "./../api";

export default function Lists() {
  const { currentAccount } = useVent();

  console.log("Lists");
  return (
    <>
      {/* <h2>Last Paid</h2>
      <div className="paid-box">
        <PaidCard logoName={"avax.network"} />
        <PaidCard logoName={"avax.network"} />
        <PaidCard logoName={"avax.network"} />
        <PaidCard logoName={"avax.network"} />
      </div> */}
      <h2>Saved Vents</h2>
      {currentAccount ? (
        <SavedVents currentAccount={currentAccount} />
      ) : (
        <div
          className="flex-column justify-center align-center"
          style={{ height: "30%" }}
        >
          <NotConnected />
        </div>
      )}
      <h2>Joined Vents</h2>
      {currentAccount ? (
        <JoinedVents />
      ) : (
        <>
          <div
            className="flex-column align-center justify-center"
            style={{ height: "30%" }}
          >
            <NotConnected />
          </div>
        </>
      )}
    </>
  );
}

const SavedVents = React.memo(({ currentAccount }) => {
  const { savedVents, getSavedVents, flag } = useVent();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flag.lists) {
      setLoading(true);
      getSavedVents().then(() => setLoading(false));
    }
  }, [savedVents]);

  return (
    <>
      {loading ? (
        <div
          className="flex-column justify-center align-center"
          style={{ height: "30%" }}
        >
          <DotLoader size={15} color="blue" />
        </div>
      ) : savedVents && savedVents.length > 0 ? (
        <>
          <div className="events ">
            {savedVents.map((vent) => (
              <Card id={vent.uid} vent={vent} />
            ))}
          </div>
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`Sorry, no saved vents yet!`}
        />
      )}
    </>
  );
});

const JoinedVents = ({}) => {
  const {
    flag,
    flagJoined,
    constants,
    currentNetwork,
    Contract,
    joinedVents,
    getJoinedVents,
    switchNetwork,
  } = useVent();
  const { networks } = constants;

  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState("");

  async function _getjoined() {
    setLoading(true);
    await getJoinedVents();
    setLoading(false);
  }

  useEffect(() => {
    setSelectedChain(currentNetwork);
  }, [currentNetwork]);

  useEffect(() => {
    if (Contract && !flag.lists_joined) _getjoined();
  }, [Contract, flag, currentNetwork]);

  return (
    <>
      <div className="flex-row align-center" style={{ gap: "1rem" }}>
        <Select
          value={selectedChain}
          defaultValue={selectedChain.toLowerCase()}
          style={{
            width: "150px",
          }}
          onChange={(e) => {
            setSelectedChain(e);
            if (e.toLowerCase() === currentNetwork.toLowerCase())
              return flagJoined(true);

            flagJoined(false);
          }}
          options={networks.map((e) =>
            e.value !== currentNetwork
              ? e
              : { ...e, label: `${e.label}  (active)` }
          )}
        />
        <Button
          className="btn btn--primary"
          disabled={
            currentNetwork.toLowerCase() === selectedChain.toLowerCase()
          }
          style={{
            // width: "100px",
            padding: "0 1rem",
            fontSize: ".8rem",
            fontWeight: "700",
          }}
          onClick={() => switchNetwork(selectedChain)}
        >
          Switch Network
        </Button>
      </div>
      {loading ? (
        <div
          className="flex-column justify-center align-center"
          style={{ height: "30%" }}
        >
          <DotLoader size={30} color="blue" />
        </div>
      ) : joinedVents && joinedVents.length > 0 ? (
        <>
          <div className="events events-box" style={{ marginTop: "2rem" }}>
            {joinedVents.map((vent) => (
              <Card id={vent.uid} vent={vent} />
            ))}
          </div>
        </>
      ) : (
        <Empty
          style={{ height: "40%" }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`Sorry, there is no vents you joined in this chain!`}
        />
      )}
    </>
  );
};
