import React, { useEffect } from "react";
import Card from "../components/home/Card";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

import { useVent } from "../Context";

const AllVents = React.memo(() => {
  const { Vents, getAllVents, currentAccount } = useVent();

  useEffect(() => {
    // getAllVents();
  }, []);

  console.log("AllVents");
  return (
    <>
      <h2 onClick={() => console.log(currentAccount)}>All Events</h2>
      <div className="events">
        {Vents && Vents.length > 0 ? (
          <>
            {Vents.map((vent) => (
              <Card id={vent.uid} vent={vent} />
            ))}
          </>
        ) : (
          <h3
            className="center"
            style={{ position: "absolute", zIndex: "50", top: "0" }}
          >
            <ClimbingBoxLoader color="blue" size={20} />
          </h3>
        )}
      </div>
    </>
  );
});

export default AllVents;
