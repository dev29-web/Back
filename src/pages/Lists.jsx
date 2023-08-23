import React from "react";

import Card from "../components/home/Card";
import PaidCard from "../components/lists/PaidCard";

import { useVent } from "../Context";

export default function Lists() {
  //
  const { logoName, SavedVents, handleSidebar } = useVent();

  console.log("Lists");
  return (
    <>
      <h2>Last Paid</h2>
      <div className="paid-box">
        <PaidCard logoName={logoName} />
        <PaidCard logoName={logoName} />
        <PaidCard logoName={logoName} />
        <PaidCard logoName={logoName} />
      </div>
      <h2>Saved Vents</h2>
      <div className="events">
        {SavedVents && SavedVents.length > 0 ? (
          <>
            {SavedVents.map((vent) => (
              <Card id={vent.uid} vent={vent} handleSidebar={handleSidebar} />
            ))}
          </>
        ) : (
          <h3>Loading...</h3>
        )}
      </div>
    </>
  );
}
