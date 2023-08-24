import React, { useEffect, useRef, useState } from "react";

import Draggable from "react-draggable";
import { PlusOutlined, DeleteFilled } from "@ant-design/icons";
import {
  Button,
  Select,
  Switch,
  Modal,
  message,
  Space,
  Form,
  Input,
  InputNumber,
} from "antd";

import { useVent } from "../Context.jsx";
import NotConnected from "./NotConnected.jsx";

const App = ({}) => {
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

  const [network, setNetwork] = useState("ethereum");
  const [isPublic, setPublic] = useState(true);

  //State from context
  const {
    currentNetwork,
    currentAccount,
    networks,
    coin,
    shortenAddress,
    handleAddForm,
    handleModal,
    modal,
    loading_modal,
  } = useVent();

  useEffect(() => {
    setNetwork(currentNetwork);
    const { vent } = modal;
    console.log("form", vent);
    if (!modal || !vent || Object.keys(vent).length <= 0) return;
    console.log("form 2", vent);

    const nativeCoin = coin(vent.chainName)?.coin;
    form.setFieldsValue({
      name: vent.name,
      network: vent.chainName.toLowerCase(),
      coin: [nativeCoin, vent.token && "aUSDC"],
      //update
      teams: [],
    });
  }, [modal]);

  function handleClose() {
    setLimit(0);
    setPublic(true);
    form.setFieldsValue({
      name: "",
      coin: undefined,
      teams: [],
    });
    handleModal(false);
  }

  const [limit, setLimit] = useState(0);
  const [form] = Form.useForm();
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
            {modal?.title || "Add"} Vent
            <p className="form--subtitle">
              connected:{" "}
              <p>{currentAccount && shortenAddress(currentAccount, 13)}</p>
              <span style={{ textTransform: "capitalize" }}>
                {currentNetwork}
              </span>
            </p>
          </div>
        }
        open={modal?.open}
        onCancel={() => {
          !loading_modal && handleClose();
        }}
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
        {/* Check Connected */}
        {currentAccount === "" || currentAccount === undefined ? (
          <div className="center">
            <h4 style={{ fontSize: "1.5rem" }}>
              <NotConnected />
            </h4>
          </div>
        ) : (
          <>
            {/* Form starts here */}
            <Form
              form={form}
              name="dynamic_form_complex"
              onFinish={(value) => {
                handleAddForm(value, network, isPublic);
              }}
              style={{
                maxWidth: 600,
              }}
              autoComplete="off"
            >
              <Form.Item
                name="public"
                label="Public:"
                style={{
                  // display: "inline-block",
                  // width: "calc(50% - 4px)",
                  marginRight: "8px",
                  marginBottom: ".6rem",
                }}
              >
                <Switch
                  disabled={modal?.title === "Edit"}
                  defaultChecked
                  value={isPublic}
                  onChange={(e) => setPublic(e)}
                />
              </Form.Item>

              <Form.Item noStyle>
                {/* Network */}
                <Form.Item
                  name="network"
                  style={{
                    display: "inline-block",
                    width: "calc(50% - 4px)",
                    marginRight: "8px",
                    marginBottom: ".6rem",
                  }}
                >
                  <Select
                    disabled={modal?.title === "Edit"}
                    value={currentNetwork.toLowerCase()}
                    defaultValue={currentNetwork.toLowerCase()}
                    onChange={(e) => setNetwork(e)}
                    options={networks.map((e) =>
                      e.value !== currentNetwork
                        ? e
                        : { ...e, label: `${e.label}  (active)` }
                    )}
                  />
                </Form.Item>

                {/* Coin */}
                <Form.Item
                  name="coin"
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
                    disabled={modal?.title === "Edit"}
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
                name="name"
                style={{ marginBottom: ".6rem" }}
                rules={[
                  {
                    required:
                      network.toLowerCase() === currentNetwork.toLowerCase(),
                    message: "Missing Vent name",
                  },
                ]}
              >
                <Input placeholder="Vent Name" />
              </Form.Item>

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
                                  placeholder={
                                    "Name " + (parseInt(field.key) + 1)
                                  }
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
                                  placeholder={
                                    "Limit " + (parseInt(field.key) + 1)
                                  }
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
                  className={
                    isPublic ? "btn btn--highlight" : "btn btn--primary"
                  }
                  style={{
                    width: "100%",
                    height: "initial",
                  }}
                  loading={loading_modal}
                  onClick={(e) => {
                    setLimit(0);
                  }}
                >
                  {
                    //
                    modal?.title === "Edit"
                      ? "update"
                      : network.toLowerCase() === currentNetwork.toLowerCase()
                      ? "Create"
                      : "Switch Network"
                  }
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};
export default App;
