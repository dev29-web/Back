import React from "react";
import dayjs from "dayjs";

export default function SpendCard({ name, address, amount, time, type }) {
  return (
    <>
      <div className="paid">
        <p className="paid__type">
          <div
            className="paid__type-box coin"
            style={{
              borderColor:
                type.toString().toLowerCase() === "ausdc"
                  ? "#ddb849"
                  : "#4352d7",
            }}
          >
            <div
              className="dot"
              style={{
                backgroundColor:
                  type.toString().toLowerCase() === "ausdc"
                    ? "#ddb849"
                    : "#4352d7",
              }}
            ></div>
          </div>
          {/* AVAX */}
        </p>
        <h4 className="paid__name">
          {name}
          <span>
            {address.toString().slice(0, 7)}
            .....
            {address.toString().slice(-5)}
          </span>
        </h4>
        <p className="paid__time">{dayjs(time).format("DD MMM, YY")}</p>
        <h6 className="paid__amount">
          {parseFloat(amount).toFixed(5 - amount.length)}
          <span> {type.toLowerCase()}</span>
        </h6>
      </div>
    </>
  );
}
