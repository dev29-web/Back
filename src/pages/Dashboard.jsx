import React, { useEffect, useState } from "react";

import OwnCard from "../components/dashboard/OwnCard";
import { GoPlus } from "react-icons/go";
import { useVent } from "../Context";
import NotConnected from "../components/NotConnected";

import { Empty } from "antd";

export default function Dashboard({}) {
  const {
    handleSidebar,
    handleSidebar2,
    getOwnerVents,
    handleModal,
    currentAccount,
    flag,
    ownVents,
  } = useVent();

  useEffect(() => {
    if (flag.dashboard || !currentAccount) return;

    getOwnerVents(currentAccount);
  }, [currentAccount]);

  console.log("Dashboard", currentAccount, ownVents);
  return (
    <>
      {/* Filter section */}
      <div className="flex-row filters-box">
        {/* Title */}
        <h2 onClick={() => handleSidebar2(true)}>Your Vents</h2>
        {/* Filter Buttons */}
        <button className="ml-a btn btn--secondary btn--secondary">
          By date
        </button>
        <button className="btn btn--secondary btn--secondary">By date</button>
        <button className="btn btn--secondary btn--secondary-active">
          By date
        </button>

        {/* Create Button */}
        <button
          className="btn btn--highlight btn--create"
          onClick={() => currentAccount && handleModal(true, "Add")}
        >
          Create new vent <GoPlus />
        </button>
      </div>
      {!currentAccount ? (
        <>
          <div
            className="flex-column align-center justify-center"
            style={{ height: "33%", fontSize: "1.3rem" }}
          >
            <NotConnected />
          </div>
        </>
      ) : ownVents && ownVents.length > 0 ? (
        <div className="events events-box">
          {ownVents.map((vent) => (
            <OwnCard
              id={vent.uid}
              handleSidebar={handleSidebar}
              handleSidebar2={handleSidebar2}
              vent={vent}
            />
          ))}
        </div>
      ) : (
        <Empty
          className="flex-column justify-center align-center"
          style={{ height: "40%", marginTop: "2rem" }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`Sorry, no vents created yet!`}
        />
      )}
    </>
  );
}
