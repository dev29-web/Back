import React, { useEffect } from "react";
import Card from "../components/home/Card";

import { useVent } from "../Context";

const AllVents = React.memo(() => {
  const { Vents, handleSidebar, getAllVents } = useVent();

  useEffect(() => {
    // getAllVents();
  }, []);

  console.log("AllVents");
  return (
    <>
      <h2>All Events</h2>
      <div className="events">
        {Vents && Vents.length > 0 ? (
          <>
            {Vents.map((vent) => (
              <Card id={vent.uid} handleSidebar={handleSidebar} vent={vent} />
            ))}
          </>
        ) : (
          <h3>Loading...</h3>
        )}
      </div>
    </>
  );
});

export default AllVents;
