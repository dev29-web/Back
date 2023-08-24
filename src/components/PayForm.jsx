import React, { useEffect, useRef, useState } from "react";

import Draggable from "react-draggable";
import {
  Button,
  Select,
  Modal,
  message,
  Space,
  Form,
  Input,
  InputNumber,
} from "antd";

import { useVent } from "../Context.jsx";

const balance = "10";
const PayForm = React.memo(({}) => {
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const [network, setSelectedNetwork] = useState("ethereum");
  const [selectedCoin, setSelectedCoin] = useState("");
  const [amount, setAmount] = useState(0);

  const {
    currentNetwork,
    networks,
    coin,
    address_shorten,
    handlePayForm,
    handleModal2,
    modal,
  } = useVent();

  ///////// Form Structure
  // amount: 13;
  // fromCoin: "AVAX";
  // fromNetwork: "avalanche";
  // name: "agas";
  // receiver: "afa";
  // toCoin: Array["AVAX"];
  // toNetwork: "polygon";

  useEffect(() => {
    setSelectedNetwork(currentNetwork);
    const { vent2 } = modal;
    const vent = vent2;
    console.log("payform", vent);
    if (!modal || !vent || Object.keys(vent).length <= 0) return;

    const nativeCoin = coin(vent.chainName)?.coin;
    //Pay form setup
    if (modal.open2 && modal.title2 === "Pay") {
      setButtonTitle("Send");

      //Update form values
      form.setFieldsValue({
        toNetwork: vent.chainName.toLowerCase(),
        toCoin: [nativeCoin, vent.token && "aUSDC"],
        receiver: vent.owner,
      });
      return;
    }

    //Spend form setup
    form.setFieldsValue({
      toNetwork: vent.chainName.toLowerCase(),
      toCoin: [nativeCoin, vent.token && "aUSDC"],
      fromNetwork: vent.chainName.toLowerCase(),
    });
    setSelectedNetwork(vent.chainName.toLowerCase());
    setButtonTitle("Spend");
  }, [modal]);

  const [buttonTitle, setButtonTitle] = useState("Send");
  const changePayButton = (coin) => {
    const _toCoin = form.getFieldValue("toCoin");
    const _toNetwork = form.getFieldValue("toNetwork");

    //Checkers
    if (_toCoin.includes(coin)) {
      if (coin === "aUSDC" && network !== _toNetwork.toLowerCase()) {
        setButtonTitle("Cross Send");
        return;
      }
      setButtonTitle("Send");
      return;
    }
    setButtonTitle("Swap & Send");
    // if( coin )
    console.log(network, coin, _toNetwork, _toCoin, coin in _toCoin);
  };

  const [form] = Form.useForm();

  const handleCancle = () => {
    form.setFieldsValue({
      amount: 0.5,
      fromCoin: undefined,
      fromNetwork: currentNetwork,
      name: "",
      receiver: "",
      toCoin: undefined,
      toNetwork: "",
    });

    setSelectedNetwork(currentNetwork);
    setSelectedCoin("");
    console.log("first");
    setAmount(0);

    handleModal2(false);
  };

  function usdcOption() {
    return (
      <Select.Option value="aUSDC" label="aUSDC">
        <Space>
          <span role="img" aria-label="aUSDC">
            🪙
          </span>
          aUSDC
        </Space>
      </Select.Option>
    );
  }
  return (
    <>
      <Modal
        className="prevent-select"
        width={500}
        style={{
          marginBottom: "1rem",
        }}
        //Title of the modal
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
              fontSize: "1.3rem",
              marginBottom: "1rem",
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
          >
            {modal?.title2 || "Pay"} Vent
            <p className="form--subtitle">
              connected: <p>{address_shorten}</p>
              <span style={{ textTransform: "capitalize" }}>
                {currentNetwork}
              </span>
            </p>
          </div>
        }
        open={modal?.open2}
        onCancel={handleCancle}
        //Footer diabled
        footer={null}
        //Drag handle
        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            nodeRef={draggleRef}
            onStart={(event, uiData) => onStart(event, uiData)}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        <Form
          form={form}
          name="dynamic_form_complex"
          onFinish={(value) => handlePayForm(value, amount)}
          style={{
            maxWidth: 600,
          }}
          autoComplete="off"
        >
          <Form.Item noStyle>
            <Form.Item
              name="toNetwork"
              style={{
                display: "inline-block",
                width: "calc(50% - 4px)",
                marginRight: "8px",
                marginBottom: ".6rem",
              }}
              rules={[
                {
                  required:
                    network.toLowerCase() === currentNetwork.toLowerCase(),
                  message: "Select one network to deploy",
                },
              ]}
            >
              <Select
                disabled={true}
                value={currentNetwork.toLowerCase()}
                defaultValue={currentNetwork.toLowerCase()}
                options={networks.map((e) =>
                  e.value !== currentNetwork
                    ? e
                    : { ...e, label: `${e.label}  (active)` }
                )}
              />
            </Form.Item>

            {/* TO */}
            <Form.Item
              name="toCoin"
              style={{
                display: "inline-block",
                width: "calc(50% - 4px)",
                marginBottom: ".6rem",
              }}
              rules={[
                {
                  required:
                    network.toLowerCase() === currentNetwork.toLowerCase(),
                },
              ]}
            >
              <Select
                mode="multiple"
                disabled={true}
                placeholder="select coins"
                optionLabelProp="label"
                style={{
                  color: "gray",
                  borderColor: "rgba(0, 0, 0, 0.5)",
                }}
              >
                <Select.Option
                  value={coin(network)?.coin}
                  label={coin(network)?.coin}
                >
                  <Space>
                    <span role="img" aria-label={coin(network)?.coin}>
                      {coin(network)?.emoji}
                    </span>
                    {coin(network)?.coin}
                    <span
                      style={{ color: "rgba(gray, .6)", fontSize: ".6rem" }}
                    >
                      ({network.toUpperCase()})
                    </span>
                  </Space>
                </Select.Option>
                <Select.Option value="aUSDC" label="aUSDC">
                  <Space>
                    <span role="img" aria-label="aUSDC">
                      🪙
                    </span>
                    aUSDC
                  </Space>
                </Select.Option>
              </Select>
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="receiver"
            style={{ marginBottom: ".6rem" }}
            rules={[
              {
                required: modal?.title === "Pay",
                message: "Missing receiver address",
              },
            ]}
          >
            <Input
              placeholder="Receiver address"
              disabled={modal.title2 === "Pay"}
            />
          </Form.Item>

          {/* FROM */}
          <Form.Item noStyle>
            <Form.Item
              name="fromNetwork"
              style={{
                display: "inline-block",
                width: "calc(50% - 4px)",
                marginRight: "8px",
                marginBottom: ".6rem",
              }}
              rules={[
                {
                  required:
                    network.toLowerCase() === currentNetwork.toLowerCase(),
                  message: "Select one network to send from",
                },
              ]}
            >
              <Select
                disabled={modal?.title2 === "Spend"}
                value={currentNetwork.toLowerCase()}
                defaultValue={currentNetwork.toLowerCase()}
                onChange={(e) => {
                  setSelectedNetwork(e);

                  //Update all its child to none
                  form.setFieldsValue({
                    fromCoin: undefined,
                    amount: 0,
                  });
                  setSelectedCoin("");
                }}
                options={networks.map((e) =>
                  e.value !== currentNetwork
                    ? e
                    : { ...e, label: `${e.label}  (active)` }
                )}
              />
            </Form.Item>

            {/* Coin */}
            <Form.Item
              name="fromCoin"
              style={{
                display: "inline-block",
                width: "calc(50% - 4px)",
                marginBottom: ".6rem",
              }}
              rules={[
                {
                  required:
                    network.toLowerCase() === currentNetwork.toLowerCase(),
                },
              ]}
            >
              <Select
                placeholder="select coins"
                optionLabelProp="label"
                onChange={(coin) => {
                  setSelectedCoin(coin);
                  changePayButton(coin);
                }}
                style={{
                  color: "gray",
                  borderColor: "rgba(0, 0, 0, 0.5)",
                }}
              >
                <Select.Option
                  value={coin(network)?.coin}
                  label={coin(network)?.coin}
                >
                  <Space>
                    <span role="img" aria-label={coin(network)?.coin}>
                      {coin(network)?.emoji}
                    </span>
                    {coin(network)?.coin}
                    <span
                      style={{ color: "rgba(gray, .6)", fontSize: ".6rem" }}
                    >
                      ({network.toUpperCase()})
                    </span>
                  </Space>
                </Select.Option>
                {modal && modal?.title2 === "Spend"
                  ? !modal.vent2.token
                    ? null
                    : usdcOption()
                  : usdcOption()}
              </Select>
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="amount"
            style={{ marginBottom: ".6rem", width: "100%" }}
          >
            <InputNumber
              addonAfter={`of ${parseFloat(balance).toFixed(
                2
              )} ${selectedCoin}`} //Number
              defaultValue={0}
              value={amount}
              style={{ width: "100%" }}
              onChange={(e) => {
                setAmount(e);
              }}
            />
            <p style={{ color: "gray" }}>Estimated Fee:</p>
          </Form.Item>
          <Form.Item
            name="name"
            style={{ marginBottom: ".6rem", width: "100%" }}
            rules={[
              {
                required:
                  network.toLowerCase() === currentNetwork.toLowerCase(),
                message:
                  "Missing " + modal?.title2 === "Spend" ? "reason" : "name",
              },
            ]}
          >
            <Input
              placeholder={
                modal?.title2 === "Spend" ? "Reason Why?" : "Your name"
              }
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              className="btn btn--highlight"
              style={{
                width: "100%",
                height: "initial",
              }}
              onClick={(e) => {
                //
              }}
            >
              {
                //
                buttonTitle ? buttonTitle : "..."
              }
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
export default PayForm;
