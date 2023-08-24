import React from "react";
import { BrowserRouter } from "react-router-dom";

import Navbar from "./components/Navbar";
import Header from "./components/Header";

import Body from "./Body";

import ModalsBody from "./ModalsBody";

export default function App() {
  console.log("App");
  return (
    <>
      <BrowserRouter>
        <section className="root-body">
          <Navbar />
          <section>
            <Header />
            <section className="body">
              <Body />
            </section>

            <ModalsBody />
          </section>
        </section>
      </BrowserRouter>
    </>
  );
}
