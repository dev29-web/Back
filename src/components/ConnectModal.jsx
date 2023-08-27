import React from "react";
import { Modal } from "antd";

import { useVent } from "../Context";

const ConnectModal = React.memo(() => {
  const {
    connectModal,
    setConnectModal,
    connectMetamask,
    connectSignInWithEthereum,
  } = useVent();

  return (
    <>
      <Modal
        title={<span>&nbsp;</span>}
        open={connectModal}
        // onOk={handleOk}
        footer={null}
        onCancel={() => setConnectModal(false)}
        width={500}
      >
        <div
          className="flex-column justify-around"
          style={{ height: "100%", gap: "1rem" }}
        >
          <button
            className="btn btn--primary flex-row justify-center align-center"
            style={{ fontSize: "1.7rem", width: "100%" }}
            onClick={connectMetamask}
          >
            connect
            <img
              width={"30px"}
              style={{ marginLeft: "1rem" }}
              className="btn--connect-icon"
              src="metamask.svg"
            />
          </button>
          <button
            className="btn btn--siwe flex-row justify-center align-center"
            style={{ fontSize: "1.7rem", width: "100%" }}
            onClick={connectSignInWithEthereum}
          >
            Sign in with Ethereum
            <img
              width={"40px"}
              style={{ marginLeft: "1rem", height: "40px" }}
              className="btn--connect-icon"
              src="siwe.png"
            />
          </button>
        </div>
      </Modal>
    </>
  );
});
export default ConnectModal;
