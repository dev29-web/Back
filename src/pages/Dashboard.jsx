import React from "react";

import OwnCard from "../components/dashboard/OwnCard";
import { GoPlus } from "react-icons/go";
import Card from "./../components/home/Card";
import { useVent } from "../Context";

export default function Dashboard({}) {
  const { handleSidebar, handleSidebar2, SavedVents, handleModal } = useVent();

  console.log("Dashboard", SavedVents);
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
          onClick={() => handleModal(true, "Add")}
        >
          Create new vent <GoPlus />
        </button>
      </div>

      <div className="events events-box">
        {SavedVents &&
          SavedVents.map((vent) => (
            <OwnCard
              id={vent.uid}
              handleSidebar={handleSidebar}
              handleSidebar2={handleSidebar2}
              vent={vent}
            />
          ))}
      </div>
      <h2 onClick={() => handleSidebar2(true)}>Joined Vents</h2>
      <div className="events events-box">
        {/* <Card
          handleSidebar={handleSidebar}
          handleSidebar2={handleSidebar2}
          logoName={logoName}
        />
        <Card
          handleSidebar={handleSidebar}
          handleSidebar2={handleSidebar2}
          logoName={logoName}
        /> */}
      </div>
    </>
  );
}
