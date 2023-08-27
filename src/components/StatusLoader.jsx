import React from "react";

import { Modal } from "antd";
import { ClockLoader, ClimbingBoxLoader, CircleLoader } from "react-spinners";

export default class StatusLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hash: "",
      open: false,
      status: "",
      description: "",
    };
  }

  componentDidMount() {
    this.setState({
      open: this.props.open,
    });
  }

  async loadData() {
    try {
      const res = await fetch("https://api.apijson.com/...");
      const blocks = await res.json();
      const dataPanelone = blocks.panelone;
      const dataPaneltwo = blocks.paneltwo;

      this.setState({
        panelone: dataPanelone,
        paneltwo: dataPaneltwo,
      });
    } catch (e) {
      console.log(e);
    }
  }
  render() {
    return (
      <>
        <Modal
          title={<span>&nbsp;</span>}
          open={this.state.open}
          // onOk={handleOk}
          footer={null}
          onCancel={() => this.setState({ open: false })}
          width={300}
          centered
        >
          <div
            className="flex-column justify-around"
            style={{ height: "100%", gap: "1rem" }}
          >
            <ClockLoader color={"#000"} loading={true} size={150} />
            {/* Cloclloader, circleloader, climbingbox */}
          </div>
        </Modal>
      </>
    );
  }
}
