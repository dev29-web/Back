import React, { useCallback, useState } from "react";
import { GoPersonFill, GoFileDirectoryFill, GoHomeFill } from "react-icons/go";

import { Link, NavLink } from "react-router-dom";

const logoUrl =
  "https://i0.wp.com/novafuture.blog/wp-content/uploads/2018/09/vent-logo.jpg?fit=840%2C473&ssl=1";

export default function Navbar({}) {
  const [activeBtn, setActiveBtn] = useState({
    home: true,
    list: false,
    dashboard: false,
  });

  const handleActiveBtn = useCallback(
    (btn) => {
      setActiveBtn({
        home: btn === "home",
        list: btn === "list",
        dashboard: btn === "dashboard",
      });
    },
    [activeBtn]
  );

  return (
    <nav className="navbar flex-column align-center">
      <div>
        <img className="logo rounded" src={logoUrl} alt="Vent" />
      </div>
      <ul>
        <NavLink to="/">
          <li
            className={`nav-li ${activeBtn.home && "active-li"}`}
            onClick={() => handleActiveBtn("home")}
          >
            <GoHomeFill className={`${activeBtn.home && "active-icon"}`} />
          </li>
        </NavLink>
        <NavLink to="/lists">
          <li
            className={`nav-li ${activeBtn.list && "active-li"}`}
            onClick={() => handleActiveBtn("list")}
          >
            <GoFileDirectoryFill
              className={`${activeBtn.list && "active-icon"}`}
            />
          </li>
        </NavLink>
        <NavLink to="/dashboard">
          <li
            className={`nav-li ${activeBtn.dashboard && "active-li"}`}
            onClick={() => handleActiveBtn("dashboard")}
          >
            <GoPersonFill
              className={`${activeBtn.dashboard && "active-icon"}`}
            />
          </li>
        </NavLink>
      </ul>
    </nav>
  );
}
