import React, { useEffect, useState } from "react";
import _Image from "../_Image";

import { useVent } from "../../Context";

const Card = React.memo(({ id, vent }) => {
  const { logoName, coin, handleModal2, handleSidebar } = useVent();

  console.log("card", vent);
  return (
    <>
      <div key={id} className="card card--verified cur-p">
        <div className="image">
          <_Image logo={logoName(vent?.chainName)} alt={vent?.chainName} />
        </div>
        <div
          className="card__body"
          onClick={() => handleSidebar(true, id, vent?.owner, vent?.chainName)}
        >
          <p className="card__body--header">{vent?.chainName}</p>
          <h3 styleName="card__body--title">{vent?.name}</h3>
          <ul className="card__body--coins">
            <li>{coin(vent?.chainName)?.coin}</li>
            {vent?.token && <li>aUSDC</li>}
          </ul>
        </div>
        <div
          className="card__footer"
          // onClick={() => handleModal2(true, "Pay", vent)}
        >
          <h5 className="card__footer--address">
            {vent?.owner.toString().slice(0, 9)}
            .....
            {vent?.owner.toString().slice(-6)}
          </h5>
          <a
            className="card__footer--btn"
            onClick={() => handleModal2(true, "Pay", vent)}
          >
            Pay {">>"}
          </a>
        </div>
      </div>
    </>
  );
});
export default Card;
