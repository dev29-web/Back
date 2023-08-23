import React from "react";
import _Image from "../_Image";

export default function PaidCard({ logoName }) {
  const amount = "10";
  const color = "red";

  return (
    <>
      <div className="paid">
        <div className="flex-row align-center">
          <_Image logo={"avax.network"} alt={"Avalanche"} />
          <h4 className="paid__name">Birthday asfagaga</h4>
        </div>
        <p className="paid__type">
          <div className="paid__type-box coin" style={{ borderColor: color }}>
            <div className="dot" style={{ backgroundColor: color }}></div>
          </div>
          AVAX
        </p>
        <h6 className="paid__from">
          From
          <p className="paid__from-address">
            {"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8"
              .toString()
              .slice(0, 7)}
            .....
            {"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8".toString().slice(-5)}
          </p>
        </h6>
        <h6 className="paid__from">
          To
          <p className="paid__from-address">
            {"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8"
              .toString()
              .slice(0, 7)}
            .....
            {"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8".toString().slice(-5)}
          </p>
        </h6>
        <p className="paid__time">10 May, 23</p>
        <h6 className="paid__amount">
          {parseFloat(amount).toFixed(5 - amount.length)}
          <span> avax</span>
        </h6>
      </div>
    </>
  );
}
