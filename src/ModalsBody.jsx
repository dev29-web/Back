import React, { useState } from "react";

import Form from "./components/Form";
import PayForm from "./components/PayForm";
import ConnectModal from "./components/ConnectModal";

import Sidebar from "./components/Sidebar";
//SideBar Childrens
import {
  SideBarForUser,
  SideBarForSpend,
  SideBarForOwner,
  EditTeamModal,
} from "./components/home/_SideBar";

import { useVent } from "./Context";

export default function ModalsBody() {
  const {
    sidebar,
    handleSidebar,
    handleSidebar2,
    isSameNetwork,
    isSameAddress,
    currentAccount,
  } = useVent();

  const [open, setOpen] = useState(true);

  return (
    <>
      {/* <EditTeamModal open={open} setOpen={setOpen} /> */}
      <ConnectModal />
      <Form />
      <PayForm />
      <Sidebar
        handleSidebar={handleSidebar}
        sidebar={sidebar}
        children={
          !isSameAddress(sidebar?.cardOwner, currentAccount) ||
          !isSameNetwork(sidebar?.chainName) ? (
            <SideBarForUser />
          ) : (
            <SideBarForOwner />
          )
        }
      />
      <Sidebar
        handleSidebar={handleSidebar2}
        sidebar={{ show: sidebar.show2, width: sidebar.width2 }}
        children={<SideBarForSpend name={sidebar.name} />}
      />
    </>
  );
}
