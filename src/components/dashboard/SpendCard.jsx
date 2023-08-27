import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ethers } from "ethers";

import { Tooltip } from "antd";

export default function SpendCard({ name, address, amount, time, type }) {
  return (
    <>
      <div className="paid cur-d">
        <p className="paid__type">
          <div
            className="paid__type-box coin"
            style={{
              borderColor:
                type?.toString().toLowerCase() === "ausdc"
                  ? "#ddb849"
                  : "#4352d7",
            }}
          >
            <div
              className="dot"
              style={{
                backgroundColor:
                  type?.toString().toLowerCase() === "ausdc"
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
            {address.toString().slice(0, 8)}
            .....
            {address.toString().slice(-6)}
          </span>
        </h4>
        <p className="paid__time">
          {dayjs(ethers.utils.formatUnits(time.toString(), "wei")).format(
            "DD MMM, YY"
          )}
        </p>
        <Amount amount={amount} type={type} />
        {/* </Tooltip> */}
      </div>
    </>
  );
}

const Amount = React.memo(({ amount, type }) => {
  const { formatUnits } = ethers.utils;
  const [_amount, setAmount] = useState();

  useEffect(() => {
    if (amount) {
      if (String(type).toLowerCase() === "ausdc") {
        setAmount(formatUnits(amount.toString(), "mwei").toString());
        return;
      }
      setAmount(formatUnits(amount.toString(), "ether").toString());
    }
  }, []);
  return (
    <Tooltip title={`${amount}`}>
      <h6 className="paid__amount">
        {parseFloat(_amount).toFixed(2)}
        <span> {type?.toLowerCase()}</span>
      </h6>
    </Tooltip>
  );
});
