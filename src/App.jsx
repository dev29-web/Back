import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Header from "./components/Header";

import AllVents from "./pages/AllVents";
import Lists from "./pages/Lists";
import Dashboard from "./pages/Dashboard";
import NoPage from "./pages/NoPage";

import Sidebar from "./components/Sidebar";
import Form from "./components/Form";
import PayForm from "./components/PayForm";
import ConnectModal from "./components/ConnectModal";
//SideBar Childrens
import {
  SideBarForUser,
  SideBarForSpend,
  SideBarForOwner,
} from "./components/home/_SideBar";

import { useVent } from "./Context";

export default function App() {
  const { sidebar, handleSidebar, handleSidebar2 } = useVent();

  console.log("App");
  return (
    <>
      <BrowserRouter>
        <section className="root-body">
          <Navbar />
          <section>
            <Header />
            <section className="body">
              <section
                className="content"
                style={{
                  flex: sidebar.show
                    ? `${100 - sidebar.width}%`
                    : sidebar.show2
                    ? `${100 - sidebar.width2}%`
                    : "100%",
                }}
              >
                <Routes>
                  <Route path="/" element={<AllVents />} />
                  <Route path="/lists" element={<Lists />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} /> */}

                  <Route path="*" element={<NoPage />} />
                </Routes>
              </section>
              <div
                className="sidebar--template"
                style={{
                  flex: sidebar.show ? `${sidebar.width}%` : "0",
                }}
              ></div>
              <div
                className="sidebar--template"
                style={{
                  flex: sidebar.show2 ? `${sidebar.width2}%` : "0",
                }}
              ></div>
            </section>

            <ConnectModal />
            <Form />
            <PayForm />
            <Sidebar
              handleSidebar={handleSidebar}
              sidebar={sidebar}
              children={
                !sidebar.isOwner ? <SideBarForUser /> : <SideBarForOwner />
              }
            />
            <Sidebar
              handleSidebar={handleSidebar2}
              sidebar={{ show: sidebar.show2, width: sidebar.width2 }}
              children={<SideBarForSpend name={sidebar.name} />}
            />
          </section>
        </section>
      </BrowserRouter>
    </>
  );
}
