import React, { useEffect, useState } from "react";
import _Image from "../_Image";

import { useVent } from "../../Context";
import VentDB from "./../../api";

import { GoBookmark, GoBookmarkFill } from "react-icons/go";
import { Tooltip } from "antd";

const Card = React.memo(({ id, vent, isSidebar }) => {
  const {
    logoName,
    coin,
    handleModal2,
    handleSidebar,
    currentAccount,
    updateVentSave,
  } = useVent();

  const save = async (isSave) => {
    console.log("called");
    await VentDB.put(`save/${vent?.chainName}/${id}`, {
      save: isSave,
      address: currentAccount,
    });
    updateVentSave(vent?.chainName, id, isSave, currentAccount);
  };
  console.log("card", vent);
  return (
    <>
      <div
        key={id}
        className={`card cur-p ${vent?.verified && "card--verified"}`}
      >
        {currentAccount !== "" &&
          currentAccount !== undefined &&
          Object.keys(vent).includes("saved") && (
            <Save
              saved={
                vent?.saved.includes(String(currentAccount).toLowerCase()) ===
                true
              }
              save={save}
            />
          )}
        <div className="image">
          <_Image logo={logoName(vent?.chainName)} alt={vent?.chainName} />
        </div>
        <div
          className="card__body"
          onClick={() =>
            !isSidebar &&
            handleSidebar(
              true,
              id,
              vent?.owner,
              vent?.chainName,
              vent?.verified
            )
          }
        >
          <p className="card__body--header">{vent?.chainName}</p>
          <h3 styleName="card__body--title">
            <Tooltip title={vent?.name}>{vent?.name}</Tooltip>
          </h3>
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
            onClick={() => currentAccount && handleModal2(true, "Pay", vent)}
          >
            Pay {">>"}
          </a>
        </div>
      </div>
    </>
  );
});
export default Card;

const Save = React.memo(({ saved, save }) => {
  const [_saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(saved);
  }, []);

  return (
    <div
      className="save"
      style={{ fill: "black" }}
      onClick={() => {
        // if (_saved === saved) return;
        const isSave = !_saved;
        setSaved(isSave);
        save(isSave);
      }}
    >
      {_saved ? (
        <GoBookmarkFill color="#9e9ea6" />
      ) : (
        <GoBookmark fill="#9e9ea6" />
      )}
    </div>
  );
});
