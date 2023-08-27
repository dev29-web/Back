import React, { useEffect, useState } from "react";

import Card from "./Card";
import SpendCard from "../dashboard/SpendCard";
import BarLoader from "react-spinners/BarLoader";

import { useVent } from "../../Context";
import NotConnected from "../NotConnected";

import VentDB from "../../api";
import { ethers } from "ethers";
const { formatEther, isAddress } = ethers.utils;

import { PlusOutlined, DeleteFilled } from "@ant-design/icons";
import { Popconfirm, Tooltip, Alert, Empty } from "antd";
import { GoPencil } from "react-icons/go";

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
      if (
        vent.name === "" &&
        vent.owner === "0x0000000000000000000000000000000000000000"
      ) {
        setStatus({
          loading: false,
          error: true,
          message: (
            <>
              <h6 style={{ fontWeight: 400, fontSize: "1.5rem" }}>
                Sorry Contract
                <br /> no longer exist
              </h6>
            </>
          ),
        });
        return;
      }
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
  const {
    SidebarCtx,
    Contract,
    handleModal2,
    isSameAddress,
    currentAccount,
    isSameChain,
  } = useVent();
  const { sidebar } = SidebarCtx;

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
      isSameChain(sidebar?.chainName)
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
              <Card
                id={1}
                isSidebar={true}
                vent={{ ...vent, verified: sidebar?.verified }}
              />
              {/* Verified check */}
              {vent?.verified && (
                <Tooltip title="Verified" color={"#4352d7"}>
                  <h2>
                    Verified <img src="verify.png" alt="Verified" />
                  </h2>
                </Tooltip>
              )}

              {/* Amount */}
              <_Amount balance={vent?.balance} expense={vent?.expense || "0"} />

              {/* Details */}
              <_Details
                chainName={vent?.chainName}
                token={vent?.token}
                owner={vent?.owner}
              />

              {!isSameChain(vent?.chainName) && (
                <>
                  <Alert
                    // style={{ padding: ".8rem", gap: ".2rem" }}
                    description="If you wanted accurate details, switch to the same network as the vent."
                    type="warning"
                    closable
                  />
                </>
              )}

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
  const {
    SidebarCtx,
    Contract,
    handleModal2,
    coin,
    handleSidebar,
    isSameChain,
  } = useVent();
  const { sidebar } = SidebarCtx;

  const [open, setOpen] = useState(false);
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
      isSameChain(sidebar?.chainName)
    );

    async function _getTeams(id) {
      try {
        if (!id) return;
        const _teams = await Contract.getStaffs(id);
        console.log("getTeams success", _teams[0]);
        setTeams(_teams[0]);
      } catch (err) {
        console.log("getTeams error", err);
      }
    }
    // Teams get
    console.log("team", sidebar?.showId);
    _getTeams(sidebar?.showId);
  }, [sidebar]);

  const handleDelete = async () => {
    try {
      Contract.on("EventDeleted", async (from, eventId) => {
        console.log("eventDeleted", from, eventId);
        eventId = ethers.BigNumber.from(eventId).toNumber();
        await VentDB.delete(`/${sidebar?.chainName}/${eventId}`);
        //Mongo delete event
        message.success("Deleted");
        handleSidebar(false);
      });
      await Contract.deleteEvent(sidebar?.showId);
    } catch (err) {
      console.log(err);
    }
  };
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
              <EditNameModal
                open={open}
                setOpen={setOpen}
                name={vent?.name}
                eventId={sidebar?.showId}
                chainName={sidebar?.chainName}
                staffLength={teams?.length}
              />
              <Card
                id={sidebar?.showId}
                handle_sideBar={() => {}}
                vent={{ ...vent, verified: sidebar?.verified }}
              />
              {/* Verified check */}
              {sidebar?.verified && (
                <h2>
                  Verified <img src="verify.png" alt="Verified" />
                </h2>
              )}

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
                  Coin: <span>{coin(vent?.chainName)?.coin || ""}</span>
                </p>
              </h4>
              <div className="teams">
                {teams && teams.length > 0 ? (
                  teams?.map((team, i) => {
                    console.log("team", team);
                    return (
                      <Team
                        name={team?.name}
                        limit={team.limit}
                        expense={team?.expense}
                        address={team?.staff}
                        staffId={i}
                        eventId={sidebar?.showId}
                        chainName={vent?.chainName}
                        // open={open}
                        // setOpen={setOpen}
                      />
                    );
                  })
                ) : (
                  <p className="center">No members yet</p>
                )}
              </div>
              <div
                className="flex-row justify-around"
                style={{ marginTop: "1.2rem" }}
              >
                <button
                  className="cur-p btn--edit"
                  onClick={() => setOpen(true)}
                >
                  Edit
                </button>
                <Popconfirm
                  title="Delete the vent"
                  description="Are you sure to delete this vent?"
                  onConfirm={handleDelete}
                  onCancel={() => {}}
                  okText="Yes"
                  cancelText="No"
                >
                  <button className="cur-p btn--delete">Delete</button>
                </Popconfirm>
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
function Team({ name, limit, expense, address, staffId, eventId, chainName }) {
  const [open, setOpen] = useState(false);
  const { shortenAddress } = useVent();

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
          staffId={staffId}
          eventId={eventId}
          chainName={chainName}
        />
        <div className="team">
          <h5 className="text-overflow">{name}</h5>
          <p>{shortenAddress(address, 11)}</p>
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
export const SideBarForSpend = React.memo(({ name, spends }) => {
  const { coin, currentNetwork } = useVent();

  return (
    <>
      <h1>{name}</h1>
      <section className="spends">
        {spends && spends.length > 0 ? (
          spends.map((spend) => {
            return (
              <SpendCard
                name={spend?.name}
                address={spend?.sponsor || spend?.from}
                amount={spend?.amount}
                time={spend?.time}
                type={spend?.token ? "aUSDC" : coin(currentNetwork)?.coin}
              />
            );
          })
        ) : (
          <>
            <div className="center" style={{ height: "50vh" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={`Sorry, no ${name?.toLowerCase()} yet!`}
              />{" "}
            </div>
          </>
        )}
      </section>
    </>
  );
});

import { Modal, Form, Input, InputNumber, message, Button, Space } from "antd";

export function EditTeamModal({
  //Parse
  open,
  setOpen,
  ...form
}) {
  const { shortenAddress, parseEtherToWei, isSameAddress, Contract } =
    useVent();

  const [Team, setTeam] = useState({
    staff: "",
    name: "",
    limit: "",
  });
  const [loading, setLoading] = useState(false);

  const handleTeamForm = (name, value) => {
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

  const handleOk = async () => {
    setLoading(true);
    if (Team.limit < 0 || Team.limit < formatEther(form.expense))
      return message.warning("Limit should be greater than expense");

    // setOpen(false);
    if (!Team.name || Team.name.length === 0)
      return message.warning("Need a name");

    console.log(
      "Okay",
      form.eventId,
      form.staffId,
      Team.name,
      Team.limit,
      parseEtherToWei("1.1")
    );
    // parseEtherToWei(Team.limit)
    Contract.once("StaffEdited", async (from, staffAddress) => {
      //Mongodb add event
      if (isSameAddress(staffAddress, form.address)) {
        message.success("Updated");
        setLoading(false);
        setOpen(false);
      }
    });
    try {
      await Contract.editStaff(
        form.eventId,
        form.staffId,
        Team.name,
        parseEtherToWei(Team.limit)
      );
    } catch (err) {
      console.log(err);
      message.error("Failed");
      setLoading(false);
      return;
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    console.log("Okay", form.eventId, form.staffId);
    Contract.once("StaffDeleted", async (from, staffAddress) => {
      message.success("Deleted");
      setLoading(false);
      setOpen(false);
    });
    try {
      await Contract.deleteStaff(form.eventId, form.staffId);
    } catch (err) {
      console.log(err);
      message.error("Failed");
      setLoading(false);
      return;
    }
  };
  return (
    <>
      <Modal
        title={<h4>Edit Team</h4>}
        open={open}
        // footer={}
        onOk={handleOk}
        confirmLoading={true}
        okButtonProps={{
          loading: loading,
        }}
        okText={"Edit"}
        onCancel={() => {
          setLoading(false);
          setOpen(false);
        }}
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
              <h5 style={{ fontSize: "1rem", fontWeight: 400 }}>
                {" "}
                {shortenAddress(form.address, 15)}
              </h5>
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
                onChange={(v) => handleTeamForm("limit", v)}
                value={Number(Team.limit)}
                min={0}
                placeholder={"Limit "}
              />
            </Form.Item>
            <Form.Item>
              <DeleteFilled
                onClick={() => handleDelete()}
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

export function EditNameModal({
  //Parse
  open,
  setOpen,
  ...form
}) {
  const { isSameAddress, Contract, currentAccount, updateVentName } = useVent();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("efffect", form);
    if (open) {
      setName(form.name);
      setLimit(form.staffLength);
    }
  }, [open]);

  const handleOk = async (value) => {
    setLoading(true);

    if (!name || name.length === 0) return message.warning("Need a name");

    console.log("Okay", form.eventId, name);

    let staffs = [];
    const { teams } = value;
    if (limit > form.staffLength && teams && teams.length > 0) {
      console.log("staffs check", teams);
      teams.forEach((team) => {
        if (
          !team.address ||
          team.address.length === 0 ||
          !ethers.utils.isAddress(team.address)
        ) {
          //Check address valid
          message.warning("Enter valid team address");
          return;
        }
        if (!team.name || team.name.length === 0) {
          message.warning("Enter team name");
          return;
        }
        if (team.limit === null || team.limit.length === "") {
          message.warning("Enter team limit");
          return;
        }
        staffs.push([
          team.name,
          team.address,
          ethers.utils.parseUnits(team.limit.toString(), "ether"),
          0,
        ]); //0 is for intial balance
      });
    }

    Contract.once("EventEdited", async (owner, eventId, isStaffAdded) => {
      //Mongodb add event
      if (isSameAddress(currentAccount, owner)) {
        eventId = ethers.BigNumber.from(eventId).toNumber();
        console.log(
          "eventEdited",
          eventId,
          isStaffAdded,
          form.chainName,
          eventId
        );
        //updaate in mongo
        await VentDB.put(`/name/${form.chainName}/${eventId}`, { name });
        updateVentName(form.name, name);
        message.success("Updated");
        setLoading(false);
        setOpen(false);
      }
    });
    try {
      await Contract.editEvent(form.eventId, name, staffs);
    } catch (err) {
      console.log(err);
      setLoading(false);
      message.error("Failed");
      return;
    }
  };

  async function _addTeam(staffs) {
    // Contract.once("StaffsAdded", async (from, eventId) => {
    //   //Mongodb add event
    //   if (isSameAddress(currentAccount, from)) {
    //     //updaate in mongo
    //     message.success("Updated");
    //     setLoading(false);
    //     setOpen(false);
    //   }
    // });

    try {
      await Contract.addStaff(form.eventId, staffs);
      setLoading(false);
      setOpen(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      message.error("Failed");
      return;
    }
  }
  const [limit, setLimit] = useState(0);
  const [teamForm] = Form.useForm();
  return (
    <>
      <Modal
        title={<h4>Edit vent</h4>}
        open={open}
        // footer={}
        footer={null}
        onCancel={() => setOpen(false)}
        width={500}
      >
        <Input
          onChange={(v) => setName(v.target.value)}
          value={name}
          placeholder={"Name "}
          style={{
            marginBottom: "1rem",
          }}
        />
        <Form
          form={teamForm}
          name="dynamic_form_complex"
          onFinish={(value) => {
            handleOk(value);
          }}
          style={{
            maxWidth: 600,
          }}
          autoComplete="off"
        >
          <Form.List name="teams">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      style={{ marginBottom: "1rem" }}
                      shouldUpdate={(prevValues, curValues) => {
                        return true;
                      }}
                    >
                      {() => (
                        <>
                          <Form.Item
                            name={[field.name, "address"]}
                            style={{
                              display: "inline-block",
                              width: "calc(35% - 15px)",
                              marginRight: "10px",
                              marginBottom: "0",
                            }}
                          >
                            <Input
                              placeholder={
                                "Address " + (parseInt(field.key) + 1)
                              }
                            />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "name"]}
                            style={{
                              display: "inline-block",
                              width: "calc(35% - 15px)",
                              marginRight: "10px",
                              marginBottom: "0",
                            }}
                          >
                            <Input
                              placeholder={"Name " + (parseInt(field.key) + 1)}
                            />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "limit"]}
                            style={{
                              display: "inline-block",
                              width: "calc(35% - 15px)",
                              marginBottom: "0",
                            }}
                          >
                            <InputNumber
                              min={0}
                              placeholder={"Limit " + (parseInt(field.key) + 1)}
                            />
                          </Form.Item>
                        </>
                      )}
                    </Form.Item>

                    <DeleteFilled
                      onClick={() => {
                        setLimit(limit - 1);
                        remove(field.name);
                      }}
                      style={{
                        marginRight: "3rem",
                        marginTop: "1rem",
                        marginBottom: "0",
                        color: "red",
                      }}
                    />
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      console.log("add", limit);

                      if (limit > 3) {
                        message.warning("Only 4 team staffs per vent");
                        return;
                      }
                      setLimit(limit + 1);

                      add();
                    }}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Team
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button
              htmlType="submit"
              className={"btn btn--primary"}
              style={{
                width: "100%",
                height: "initial",
              }}
              loading={loading}
            >
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
