import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Reader from "./Reader";
import Portfolio from "./Portfolio";
import Demo from "./Demo";
import { playerAssetUrls } from "./playerPresentation";

export default function App() {
  const location = useLocation();
  const active = location.pathname === "/demo";
  useEffect(() => {
    if (location.pathname === "/overview" && location.hash) {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" });
    } else if (active || location.pathname === "/overview") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [active, location.pathname, location.hash]);
  const [visited, setVisited] = useState(active);
  if (active && !visited) setVisited(true);
  const section = new URLSearchParams(location.search).get("from");
  const returnTo =
    section && /^(0[6-9]|1[0-3])$/.test(section) ? `/?section=${section}` : "/";
  return (
    <>
      {playerAssetUrls.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
      {!active &&
        (location.pathname === "/overview" ? <Portfolio /> : <Reader />)}
      {visited && (
        <div hidden={!active} inert={!active} className="prototype-host">
          <Demo active={active} returnTo={returnTo} />
        </div>
      )}
    </>
  );
}
