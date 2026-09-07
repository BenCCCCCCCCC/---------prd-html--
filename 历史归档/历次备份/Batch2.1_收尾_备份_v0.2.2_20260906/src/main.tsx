import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Portfolio from "./Portfolio";
import Demo from "./Demo";
import "./generated/tokens.css";
import "./styles.css";
import "./generated/alignment-tokens.css";
import "./alignment.css";
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<Portfolio />} />
    </Routes>
  </HashRouter>,
);
