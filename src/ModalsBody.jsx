import React, { useEffect, useState } from "react";

import Form from "./components/Form";
import PayForm from "./components/PayForm";
import ConnectModal from "./components/ConnectModal";
import StatusLoader from "./components/StatusLoader";

import Sidebar from "./components/Sidebar";
//SideBar Childrens
import {
  SideBarForUser,
  SideBarForSpend,
  SideBarForOwner,
} from "./components/home/_SideBar";
import BarLoader from "react-spinners/BarLoader";

import { useVent } from "./Context";

export default function ModalsBody() {
  const { SidebarCtx, handleSidebar, handleSidebar2, Contract } = useVent();
  const { sidebar } = SidebarCtx;

  const [open, setOpen] = useState(true);

  return (
    <>
      <StatusLoader open={true} hash={"hash"} />
      <ConnectModal />
      <Form />
      <PayForm />
      <Sidebar1 sidebar={sidebar} handleSidebar={handleSidebar} />
      <Sidebar2
        sidebar={sidebar}
        handleSidebar2={handleSidebar2}
        Contract={Contract}
      />
    </>
  );
}

const Sidebar1 = React.memo(({ sidebar, handleSidebar }) => {
  const { currentAccount, isSameAddress, isSameChain } = useVent();

  return (
    <Sidebar
      handleSidebar={handleSidebar}
      sidebar={sidebar}
      children={
        !isSameAddress(sidebar?.cardOwner, currentAccount) ||
        !isSameChain(sidebar?.chainName) ? (
          <SideBarForUser />
        ) : (
          <SideBarForOwner />
        )
      }
    />
  );
});

const Sidebar2 = React.memo(({ sidebar, handleSidebar2, Contract }) => {
  const [spends, setSpends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sidebar?.show2 && sidebar?.showId) {
      setLoading(true);
      if (sidebar.isSponsor) {
        //Sponsor
        Contract.getSponsors(sidebar.showId).then((_spends) => {
          console.log("spends", _spends);
          setSpends([..._spends]);
          setLoading(false);
        });
      } else {
        //Expense
        Contract.getEvent_expenses(sidebar.showId).then((_expenses) => {
          console.log("spends", _expenses);
          setSpends([..._expenses]);
          setLoading(false);
        });
      }
    }
  }, [sidebar]);

  return (
    <Sidebar
      handleSidebar={handleSidebar2}
      sidebar={{ show: sidebar.show2, width: sidebar.width2 }}
      children={
        loading ? (
          <div className="center">
            <BarLoader />
          </div>
        ) : (
          <SideBarForSpend
            name={sidebar.isSponsor ? "Sponsor" : "Spends"}
            spends={spends}
          />
        )
      }
    />
  );
});
