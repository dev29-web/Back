import React from "react";
import { GoX } from "react-icons/go";

// import { SideBarForUser } from "./home/_SideBar";

export default function Sidebar({ handleSidebar, sidebar, children }) {
  console.log("sidebar");
  return (
    <>
      <div
        className="sidebar"
        style={{
          transform: sidebar.show ? "translateX(0%)" : "translateX(100%)",
          width: `${sidebar.width - 2}%`,
        }}
      >
        <div className="back cur-p" onClick={() => handleSidebar(false)}>
          <GoX />
        </div>

        {/* SideBar Content here */}
        {children}
      </div>
    </>
  );
}
