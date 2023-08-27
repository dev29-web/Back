import React, { useEffect, useState } from "react";
import { GoSearch } from "react-icons/go";
import { useVent } from "../Context";
import { Modal, Input, InputNumber, message, Button } from "antd";
import { ethers } from "ethers";

export default function Header() {
  const {
    setConnectModal,
    shortenAddress,
    apply,
    transactionStatus,
    transaction,
    parseEtherToWei,
    currentAccount,
    ssx,
    getCredentialList,
    credentialList,
  } = useVent();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentAccount && ssx && !apply && credentialList.length === 0) {
      getCredentialList();
    }
  }, [apply]);
  return (
    <header>
      <div className="header--1">
        <input
          type="text"
          placeholder="Search by vent name, address"
          onClick={async () => {
            // await transactionStatus(transaction);
            // const d = await getCredentialList();
            // console.log(credentialList[0]);
            // await ssx.storage.delete("profile");
            // let h = { _hex: "0x64e9921f", _isBigNumber: true };
            // console.log(ethers.utils.formatUnits(h, "wei").toString());
            // console.log("Header", d);
            // ethers.utils.parseUnits("1.1", "ether");
          }}
        />
        <button>
          <GoSearch />
        </button>
      </div>

      <div className="header--2">
        {apply && (
          <button
            className="btn btn--highlight"
            style={{
              fontSize: ".8rem",
              padding: ".5rem",
              marginRight: " .4rem",
            }}
            onClick={() => setOpen(true)}
          >
            Apply for Verification
          </button>
        )}
        {currentAccount ? (
          <div
            className="flex-row align-center cur-p"
            style={{
              border: "1px solid rgba(0, 0, 0, .1)",
              borderRadius: "50px",
              padding: ".1rem .5rem",
            }}
            onClick={() => setConnectModal(true)}
          >
            <div
              className="dot"
              style={{ backgroundColor: "aqua", marginRight: ".3rem" }}
            ></div>
            <h3 style={{ fontWeight: "400" }}>
              {shortenAddress(currentAccount, 17)}
            </h3>
          </div>
        ) : (
          <button
            className="btn btn--primary btn--connect"
            onClick={() => setConnectModal(true)}
          >
            connect
            <img className="btn--connect-icon" src="metamask.svg" />
          </button>
        )}
      </div>
      <EditNameModal open={open} setOpen={setOpen} />
    </header>
  );
}

export function EditNameModal({
  //Parse
  open,
  setOpen,
}) {
  const { issueVerification, ssx } = useVent();

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    idNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [Next, setNext] = useState(false);

  const handleForm = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  function ValidateEmail(email) {
    return email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  const handleSubmit = async () => {
    if (!Next) {
      const { name, email, address, phone } = form;

      if (!name || !email || !address || !phone) {
        return message.error("Please fill all the fields");
      }
      if (ValidateEmail(email) === null) {
        return message.error("Please enter a valid email");
      }
      setLoading(true);
      try {
        // await apply(form);
        await ssx?.storage.put("profile", { name, email, address, phone });
        // await issueVerification(name, address, phone, email);
        setNext(true);
        message.success("Application submitted successfully");
      } catch (error) {
        message.error(error.message);
      }
    } else {
      const { idNumber } = form;
      if (!idNumber || idNumber.length < 5) {
        return message.error("Please fill id number more than 5 digits");
      }
      setLoading(true);
      try {
        console.log(idNumber.toString());
        await issueVerification(idNumber.toString());
        message.success("Application submitted successfully");
        setNext(false);
        setOpen(false);
      } catch (error) {
        message.error(error.message);
      }
    }
    setLoading(false);
  };
  return (
    <>
      <Modal
        title={<h4 style={{ fontSize: "1.3rem" }}>Verification Application</h4>}
        open={open}
        // footer={}
        footer={null}
        onCancel={() => {
          setNext(false);
          setOpen(false);
        }}
        width={500}
      >
        <h4 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
          Please fill the form below to apply for verification
        </h4>
        {!Next ? (
          <>
            <Input
              onChange={(v) => handleForm("name", v.target.value)}
              value={form.name}
              placeholder={"Name "}
              style={{
                marginBottom: "1rem",
              }}
            />
            <Input
              onChange={(v) => handleForm("email", v.target.value)}
              value={form.email}
              placeholder={"Email"}
              style={{
                marginBottom: "1rem",
              }}
            />
            <Input
              onChange={(v) => handleForm("address", v.target.value)}
              value={form.address}
              placeholder={"Address"}
              style={{
                marginBottom: "1rem",
              }}
            />
            <InputNumber
              required={true}
              onChange={(v) => handleForm("phone", v)}
              value={form.phone}
              placeholder={"Phone"}
              style={{
                marginBottom: "1rem",
                width: "100%",
              }}
            />
          </>
        ) : (
          <>
            <h4 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Please enter a valid ID number [eg: Aadhaar]
            </h4>
            <InputNumber
              onChange={(v) => handleForm("idNumber", v)}
              value={form.idNumber}
              placeholder={"Id Number"}
              style={{
                marginBottom: "1rem",
                width: "100%",
              }}
            />
          </>
        )}

        <Button
          className={"btn btn--highlight"}
          style={{
            width: "100%",
            height: "initial",
          }}
          loading={loading}
          onClick={handleSubmit}
        >
          {Next ? "Create" : "Next"}
        </Button>
      </Modal>
    </>
  );
}
