import React, { useCallback, useState } from "react";
import { GoPersonFill, GoFileDirectoryFill, GoHomeFill } from "react-icons/go";

import { Link, NavLink } from "react-router-dom";

const logoUrl =
  "https://i0.wp.com/novafuture.blog/wp-content/uploads/2018/09/vent-logo.jpg?fit=840%2C473&ssl=1";

export default function Navbar({}) {
  return (
    <nav className="navbar flex-column align-center">
      <div>
        <img className="logo rounded" src={logoUrl} alt="Vent" />
      </div>
      <ul>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-li" : "")}
        >
          <li className={`nav-li `}>
            <GoHomeFill className={"icon"} />
          </li>
        </NavLink>
        <NavLink
          to="/lists"
          className={({ isActive }) => (isActive ? "active-li" : "")}
        >
          <li className={`nav-li `}>
            <GoFileDirectoryFill className={"icon"} />
          </li>
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active-li" : "")}
        >
          <li className={`nav-li `}>
            <GoPersonFill className={"icon"} />
          </li>
        </NavLink>
      </ul>
    </nav>
  );
}
