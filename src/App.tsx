import { useState } from "react";
// import UpdateElectron from "@/components/update";
import logoVite from "./assets/images/logo-vite.svg";
import logoElectron from "./assets/images/logo-electron.svg";
import "./assets/css/App.css";
import Layout from "@/layouts";

import { HashRouter } from "react-router";

import Router from "@/router/";

function App() {
  return (
    <HashRouter>
      <Router />
    </HashRouter>
  );
}

export default App;
