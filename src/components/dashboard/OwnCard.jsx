import React from "react";
import _Image from "../_Image";

import { message } from "antd";

import { useVent } from "../../Context";

export default function OwnCard({ id, handleSidebar, handleSidebar2, vent }) {
  const { coin, logoName, isSameChain } = useVent();

  return (
    <>
      <div
        className={`card cur-p card--own ${vent?.verified && "card--verified"}`}
      >
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
        <div className={`card__footer`}>
          <button
            className={`card__footer--btn card__footer--btn-1 ${
              !vent?.verified && "gray-1"
            }`}
            onClick={() => {
              if (!isSameChain(vent?.chainName))
                return message.warning("Please switch to the same chain", 0.6);
              handleSidebar2(true, vent?.chainName, id, true);
            }}
          >
            Sponsors
          </button>
          <button
            className={`card__footer--btn card__footer--btn-2 ${
              !vent?.verified && "gray-2"
            }`}
            onClick={() => {
              if (!isSameChain(vent?.chainName))
                return message.warning("Please switch to the same chain", 0.6);
              handleSidebar2(true, vent?.chainName, id, false);
            }}
          >
            Spends
          </button>
        </div>
      </div>
    </>
  );
}
