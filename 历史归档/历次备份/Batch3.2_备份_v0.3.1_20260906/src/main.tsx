import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./generated/tokens.css";
import "./styles.css";
import "./generated/alignment-tokens.css";
import "./alignment.css";
import "./reader.css";
import "./submission.css";
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
