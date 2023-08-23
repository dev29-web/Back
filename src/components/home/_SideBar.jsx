import React, { useEffect, useState } from "react";

import Card from "./Card";
import SpendCard from "../dashboard/SpendCard";
import BarLoader from "react-spinners/BarLoader";

import { useVent } from "../../Context";

// Sidebar UserDetail
// -----Page
export function SideBarForUser() {
  const { sidebar, Contract, handleModal2, setConnectModal } = useVent();

  const [vent, setVent] = useState(undefined);
  const [status, setStatus] = useState({
    loading: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    if (!sidebar || sidebar.show === false || sidebar.showId === "") return;

    async function _getVent(id) {
      if (Contract) {
        const vent = await Contract.Events(id).catch((err) => {
          setStatus({ loading: false, error: true, message: err.message });
          console.log("vent get error", err);
        });

        console.log("vent get success", vent);
        //Set loading to false and set vent
        setStatus({ loading: false, error: false, message: "" });
        setVent(vent);
      } else {
        setStatus({
          loading: false,
          error: true,
          message: (
            <>
              <h4>Contract not found</h4>
              <h6 style={{ fontWeight: "300", marginBottom: "-5px" }}>
                Connect to Metamask Wallet
              </h6>
              <button
                className="btn btn--primary"
                onClick={() => setConnectModal(true)}
              >
                Connect
              </button>
            </>
          ),
        });
      }
    }

    setStatus({ loading: true, error: false, message: "" });
    // Vent get
    _getVent(sidebar.showId);
  }, [sidebar]);

  return (
    <>
      {
        //Loading
        status.loading ? (
          <div className="center">
            <BarLoader color={"#000"} />
          </div>
        ) : (
          vent &&
          Object.keys(vent).length > 0 && (
            <>
              <Card id={1} handle_sideBar={() => {}} vent={vent} />
              {/* Verified check */}
              <h2>
                Verified <img src="verify.png" alt="Verified" />
              </h2>

              {/* Amount */}
              <_Amount balance={vent?.balance} expense={vent?.expense} />

              {/* Details */}
              <_Details
                chainName={vent?.chainName}
                token={vent?.token}
                owner={vent?.owner}
              />

              {/* Pay Btn */}
              <button
                onClick={() => handleModal2(true, "Pay", vent)}
                className="btn btn--primary"
              >
                Pay {">>"}{" "}
              </button>
            </>
          )
        )
      }
      {status.error && (
        <div className="center">
          <h4>{status.message}</h4>
        </div>
      )}
      {/* {console.log("sbar", Object.keys(vent))} */}
    </>
  );
}
//------Components
const _Details = React.memo(({ chainName, token, owner }) => {
  const { coin, shortenAddress } = useVent();

  return (
    <ul className="details">
      <li>
        <p className="key">network</p>
        <p className="value">{chainName}</p>
      </li>
      <li>
        <p className="key">Coins</p>
        <p className="value">{coin(chainName)?.coin}</p>
      </li>
      {token && (
        <li>
          <p className="key">Token</p>
          <p className="value">aUSDC</p>
        </li>
      )}
      <li>
        <p className="key">owner</p>
        <p className="value">{shortenAddress(owner, 15)}</p>
      </li>
      {/* <li>
        <p className="key">natwork</p>
        <p className="value">Avalanche</p>
      </li> */}
    </ul>
  );
});
const _Amount = React.memo(({ balance, expense }) => {
  const { parseWeiToEther } = useVent();

  return (
    <>
      <div className="amount">
        <h4>Balance</h4>
        <h5>
          {parseFloat(parseWeiToEther(balance)).toFixed(2)} <span>avax</span>
        </h5>
      </div>
      <div className="flex-row align-center justify-between">
        <div className="amount">
          <h4>Revenue</h4>
          <h5>
            {parseFloat(parseWeiToEther(balance, expense)).toFixed(2)}{" "}
            <span>avax</span>
          </h5>
        </div>
        <div className="amount">
          <h4>Expense</h4>
          <h5>
            {parseFloat(parseWeiToEther(expense)).toFixed(2)} <span>avax</span>
          </h5>
        </div>
      </div>
    </>
  );
});

// Sidebar Full EventDetail for Owner
// -----Page
export function SideBarForOwner() {
  const { sidebar, getVent, amount, handleModal, handleModal2 } = useVent();

  const [vent, setVent] = useState(undefined);
  const [status, setStatus] = useState({
    loading: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    if (!sidebar || sidebar.show === false || sidebar.showId === "") return;

    async function _getVent(id) {
      const vent = await getVent(id).catch((err) => {
        setStatus({ loading: false, error: true, message: err.message });
        console.log("vent get error", err);
      });

      console.log("vent get success", vent);
      //Set loading to false and set vent
      setStatus({ loading: false, error: false, message: "" });
      setVent(vent);
    }

    setStatus({ loading: true, error: false, message: "" });
    // Vent get
    _getVent(sidebar.showId);
  }, [sidebar]);

  return (
    <>
      {
        //Loading
        status.loading ? (
          <div className="center">
            <BarLoader color={"#000"} />
          </div>
        ) : (
          vent &&
          Object.keys(vent).length > 0 && (
            <>
              <Card
                id={sidebar?.showId}
                handle_sideBar={() => {}}
                vent={vent}
              />
              {/* Verified check */}
              <h2>
                Verified <img src="verify.png" alt="Verified" />
              </h2>

              {/* Amount */}
              <_Amount balance={vent?.balance} expense={vent?.expense} />

              {/* Details */}
              <_Details
                chainName={vent?.chainName}
                token={vent?.token}
                owner={vent?.owner}
              />

              {/* Pay Btn */}
              <button
                className="btn btn--primary"
                onClick={() => handleModal2(true, "Spend", vent)}
              >
                Spend {">>"}{" "}
              </button>

              <h4>
                Team
                <p>
                  Coin: <span>Avax</span>
                </p>
              </h4>
              <div className="teams">
                <Team name={"name"} amount={amount} address={"address"} />
                <Team name={"name"} amount={amount} address={"address"} />
                <Team name={"name"} amount={amount} address={"address"} />
              </div>
              <div className="flex-row justify-around">
                <button
                  className="cur-p btn--edit"
                  onClick={() => handleModal(true, "Edit", vent)}
                >
                  Edit
                </button>
                <button className="cur-p btn--delete">Delete</button>
              </div>
            </>
          )
        )
      }
      {status.error && (
        <div className="center">
          <h4>{status.message}</h4>
        </div>
      )}
    </>
  );
}
//------Components
function Team({ name, amount, address }) {
  return (
    <div className="team">
      <h5 className="text-overflow">{name}</h5>
      <p>
        {address.toString().slice(0, 7)}
        .....
        {address.toString().slice(-5)}
      </p>
      <h6>{parseFloat(amount).toFixed(1)}</h6>
      <h6>{parseFloat(amount).toFixed(1)}</h6>
    </div>
  );
}

//Sidebar Spend Detail
//-----Page
export function SideBarForSpend({ name }) {
  return (
    <>
      <h1>{name}</h1>
      <section className="spends">
        <SpendCard
          name={"Cakesaga"}
          address={"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8"}
          amount={"10"}
          time={"1692418451"}
          type={"aUSDC"}
        />
        <SpendCard
          name={"Cake"}
          address={"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8"}
          amount={"10"}
          time={"1692418451"}
          type={"avax"}
        />
        <SpendCard
          name={"Cake"}
          address={"0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8"}
          amount={"10"}
          time={"1692418451"}
          type={"avax"}
        />
      </section>
    </>
  );
}
