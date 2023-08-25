import React, { useEffect } from "react";
import _Image from "../_Image";

import { useVent } from "../../Context";

export default function OwnCard({ id, handleSidebar, handleSidebar2, vent }) {
  const { coin, logoName } = useVent();

  return (
    <>
      <div className="card card--verified cur-p card--own">
        <div className="image">
          <_Image logo={logoName(vent?.chainName)} alt={vent?.chainName} />
        </div>
        <div
          className="card__body"
          onClick={() => handleSidebar(true, id, vent?.owner, vent?.chainName)}
        >
          <p className="card__body--header">{vent?.chainName || null}</p>
          <h3 styleName="card__body--title">{vent?.name || null}</h3>
          <ul className="card__body--coins">
            <li>{coin(vent?.chainName || "avalanche")?.coin || null}</li>
            {vent?.token && <li>aUSDC</li>}
          </ul>
        </div>
        <div className="card__footer">
          <button
            className="card__footer--btn card__footer--btn-1"
            onClick={() => handleSidebar2(true, "sponsors")}
          >
            Sponsors
          </button>
          <button
            className="card__footer--btn card__footer--btn-2"
            onClick={() => handleSidebar2(true, "spends")}
          >
            Spends
          </button>
        </div>
      </div>
    </>
  );
}
