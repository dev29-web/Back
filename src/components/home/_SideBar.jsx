import React, { useEffect, useState } from "react";

import Card from "./Card";
import SpendCard from "../dashboard/SpendCard";
import BarLoader from "react-spinners/BarLoader";

import { useVent } from "../../Context";
import NotConnected from "../NotConnected";

import VentDB from "../../api";
import { ethers } from "ethers";
const { formatEther, isAddress } = ethers.utils;

import { DeleteFilled } from "@ant-design/icons";
import { GoPencil } from "react-icons/go";

const change = true;
async function _getVent(
  Contract,
  id,
  chainName,
  setVent,
  setStatus,
  sameChain
) {
  if (Contract && sameChain) {
    try {
      const vent = await Contract.Events(id);

      console.log("vent contract get success", vent);
      //Set loading to false and set vent
      setStatus({ loading: false, error: false, message: "" });
      setVent(vent);
      //
    } catch (err) {
      setStatus({
        loading: false,
        error: true,
        message: (
          <>
            <NotConnected />
          </>
        ),
      });
      console.log("vent get error", err);
    }
  } else {
    try {
      const { data } = await VentDB.get(`/${chainName}/${id}`);

      if (data && data.vent) {
        //Set loading to false and set vent
        setStatus({ loading: false, error: false, message: "" });
        const { vent } = data;
        console.log("vent mongo get success", vent);
        setVent(vent);
      } else {
        setStatus({
          loading: false,
          error: true,
          message: (
            <>
              <h6 style={{ fontWeight: 400 }}>
                Sorry Contract no longer exist
              </h6>
            </>
          ),
        });
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: true,
        message: (
          <>
            <h6 style={{ fontWeight: 400 }}>Switch network in metamask</h6>
            <h5 style={{ textTransform: "capitalize", fontWeight: 400 }}>
              to {chainName}
            </h5>
          </>
        ),
      });
      console.log("vent get error", err);
    }
  }
}

// Sidebar UserDetail
// -----Page
export function SideBarForUser() {
  const { sidebar, Contract, handleModal2, isSameAddress, currentAccount } =
    useVent();

  const [vent, setVent] = useState(undefined);
  const [status, setStatus] = useState({
    loading: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    if (!sidebar || sidebar.show === false || sidebar.showId === "") return;

    setStatus({ loading: true, error: false, message: "" });
    // Vent get
    _getVent(
      Contract,
      sidebar.showId,
      sidebar.chainName,
      setVent,
      setStatus,
      change
      // isSameNetwork(sidebar?.chainName)
    );
  }, [sidebar]);

  return (
    <>
      {status.error && (
        <div className="center">
          <h4>{status.message}</h4>
        </div>
      )}
      {
        //Loading
        status.loading ? (
          <div className="center">
            <BarLoader color={"#000"} />
          </div>
        ) : (
          vent &&
          !status.error &&
          Object.keys(vent).length > 0 && (
            <>
              <Card id={1} handle_sideBar={() => {}} vent={vent} />
              {/* Verified check */}
              <h2>
                Verified <img src="verify.png" alt="Verified" />
              </h2>

              {/* Amount */}
              <_Amount balance={vent?.balance} expense={vent?.expense || "0"} />

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

              {isSameAddress(vent?.owner, currentAccount) && (
                <button
                  onClick={() => {}}
                  style={{ fontSize: "1rem" }}
                  className="btn btn--secondary"
                >
                  Switch Network to edit
                </button>
              )}
            </>
          )
        )
      }
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
  const { sidebar, Contract, handleModal2, coin } = useVent();

  const [vent, setVent] = useState(undefined);
  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    if (!sidebar || sidebar.show === false || sidebar.showId === "") return;

    setStatus({ loading: true, error: false, message: "" });
    // Vent get
    _getVent(
      Contract,
      sidebar.showId,
      sidebar.chainName,
      setVent,
      setStatus,
      change
    );

    async function _getTeams(id) {
      try {
        if (!id) return;
        const _teams = await Contract?.getStaffs(3);
        console.log("getTeams success", _teams[0]);
        setTeams(_teams[0]);
      } catch (err) {
        console.log("getTeams error", err);
      }
    }
    // Teams get
    _getTeams(sidebar?.showId);
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
              <_Amount balance={vent?.balance} expense={vent?.expense || 0} />

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
                  Coin: <span>{coin(vent?.chainName).coin}</span>
                </p>
              </h4>
              <div className="teams">
                {teams && teams.length > 0 ? (
                  teams?.map((team) => {
                    return (
                      <Team
                        name={team?.name}
                        limit={team.limit}
                        expense={team?.expense}
                        address={team?.staff}
                        // open={open}
                        // setOpen={setOpen}
                      />
                    );
                  })
                ) : (
                  <p className="center">No members yet</p>
                )}
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
function Team({ name, limit, expense, address }) {
  const [open, setOpen] = useState(false);
  return (
    name &&
    expense &&
    address && (
      <>
        <EditTeamModal
          open={open}
          setOpen={setOpen}
          name={name}
          address={address}
          limit={limit}
          expense={expense}
        />
        <div className="team">
          <h5 className="text-overflow">{name}</h5>
          <p>
            {address.toString().slice(0, 7)}
            .....
            {address.toString().slice(-5)}
          </p>
          <h6>{parseFloat(formatEther(limit)).toFixed(1)}</h6>
          <h6>{parseFloat(formatEther(expense)).toFixed(1)}</h6>
          <GoPencil className="cur-p" onClick={() => setOpen(true)} />
        </div>
      </>
    )
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

import { Modal, Form, Input, InputNumber, message } from "antd";

export function EditTeamModal({ open, setOpen, ...form }) {
  const [Team, setTeam] = useState({
    staff: "",
    name: "",
    limit: "",
  });

  const handleTeamForm = (name, value) => {
    console.log("team", name, value);
    setTeam({ ...Team, [name]: value });
  };

  useEffect(() => {
    console.log(form);
    if (open) {
      setTeam({
        staff: form.address,
        name: form.name,
        limit: formatEther(form.limit),
      });
    }
  }, [open]);

  const handleOk = () => {
    if (Team.limit < 0 || Team.limit < formatEther(form.expense))
      return message.warning("Limit should be greater than expense");

    // setOpen(false);
    if (!Team.name || Team.name.length === 0)
      return message.warning("Need a name");

    Contract.editStaff(
      form.eventId,
      form.staffId,
      Team.name,
      parseWeiToEther(Team.limit)
    );

    VentDB.put(`/${form.chainName}/${form.id}`, {
      ...form,
      staff: Team.staff,
      name: Team.name,
      limit: parseWeiToEther(Team.limit),
    })
      .then((res) => {
        console.log("edit team mongo success", res);
        message.success("Team edited successfully");
        setOpen(false);
      })
      .catch((err) => {
        console.log("edit team mongo error", err);
        message.error("Team edit failed");
      });
  };
  return (
    <>
      <Modal
        title={<h4>Edit Team</h4>}
        open={open}
        // footer={}
        onOk={handleOk}
        okText={"Edit"}
        onCancel={() => setOpen(false)}
        width={500}
      >
        <div
          className="flex-row justify-around align-center"
          style={{ height: "100%", gap: "1rem" }}
        >
          <>
            <Form.Item
              style={{
                display: "inline-block",
                width: "calc(40% - 15px)",
                marginRight: "10px",
                marginBottom: "0",
              }}
            >
              <h5> {shortenAddress(form.address)}</h5>
            </Form.Item>
            <Form.Item
              style={{
                display: "inline-block",
                width: "calc(37% - 15px)",
                marginRight: "10px",
                marginBottom: "0",
              }}
            >
              <Input
                onChange={(v) => handleTeamForm("name", v.target.value)}
                value={Team.name}
                placeholder={"Name "}
              />
            </Form.Item>
            <Form.Item
              style={{
                display: "inline-block",
                width: "calc(37% - 15px)",
                marginBottom: "0",
              }}
            >
              <InputNumber
                onChange={(v) => handleTeamForm("limit", v.target.value)}
                value={Number(Team.limit)}
                min={0}
                placeholder={"Limit "}
              />
            </Form.Item>
            <Form.Item>
              <DeleteFilled
                onClick={() => {}}
                style={{
                  marginRight: "3rem",
                  marginTop: "1rem",
                  marginBottom: "0",
                  color: "red",
                }}
              />
            </Form.Item>
          </>
        </div>
      </Modal>
    </>
  );
}
