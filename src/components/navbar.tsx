import { unslugify } from "@/script/utils/strings";
import { bodyMedium } from "@/styles/main.module.scss";
import {
  menu,
  menuToggle,
  navbar,
  submenuToggle,
} from "@/styles/navbar.module.scss";
import { Link, graphql, useStaticQuery } from "gatsby";
import React, { useRef } from "react";

type Directory = {
  name: string;
  path: string;
  href?: string;
  parent?: Directory;
  child: Directory[];
};
interface CSSPropertiesExtended extends React.CSSProperties {
  "--delay"?: string;
  "--color"?: string;
}
function generateNav(
  parent: Directory,
  menuToggle: React.RefObject<HTMLInputElement>,
  initialHue: number = 0,
) {
  return (
    <ul style={{ "--delay": ".5s" } as CSSPropertiesExtended}>
      {parent.child
        .sort((a, b) => a.path.localeCompare(b.path))
        .map((child, i) => {
          return (
            <li
              key={child.name}
              style={
                {
                  "--delay": `${(0.5 * i) / parent.child.length}s`,
                  "--color": `oklch(var(--tone-outline) var(--chroma-primary) ${
                    initialHue + (360 * (i + 0.5)) / parent.child.length
                  }deg)`,
                } as CSSPropertiesExtended
              }
            >
              {typeof child.href !== "undefined" ? (
                <Link
                  to={child.href}
                  className={bodyMedium}
                  onClick={() => {
                    menuToggle.current!.checked = false;
                  }}
                >
                  {child.name}
                </Link>
              ) : (
                <a>{child.name}</a>
              )}
              {child.child.length ? (
                <>
                  <input
                    id={child.path}
                    className={submenuToggle}
                    type="checkbox"
                  />
                  <label htmlFor={child.path}>
                    <span className="material-symbols-rounded" id="icon_menu">
                      menu
                    </span>
                    <span className="material-symbols-rounded" id="icon_close">
                      close
                    </span>
                  </label>
                  <div
                    className={menu}
                    style={{ "--delay": ".5s" } as CSSPropertiesExtended}
                  >
                    {generateNav(
                      child,
                      menuToggle,
                      initialHue + (360 * (i + 0.5)) / parent.child.length,
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
            </li>
          );
        })}
    </ul>
  );
}

export default function Navbar() {
  const menuToggleRef = useRef<HTMLInputElement>(null);
  const data = useStaticQuery<Queries.NavbarQuery>(query);
  const paths = data.allSitePage.nodes.map(
    (node) => node.path.match(/^\/(.*?)(\.html|\/|)$/)![1],
  );
  const map = new Map<string, Directory>();
  const root: Directory = {
    name: "",
    child: [],
    path: "/",
  };
  for (const route of paths) {
    let path = "";
    let parent = root;
    if (route === "404" || route === "500") continue;
    for (const name of route.split("/")) {
      if (name.startsWith("dev-")) continue;
      path += "/" + name;
      let node = map.get(path);
      if (!node) {
        map.set(
          path,
          (node = {
            name: unslugify(name),
            path,
            parent,
            child: [],
          }),
        );
        node.name ||= data.site!.siteMetadata!.title ?? "Home";
        parent.child.push(node);
      }
      parent = node;
    }
    parent.href = `/${route}`;
  }
  return (
    <>
      <nav className={navbar}>
        <input
          id="menu_toggle"
          className={menuToggle}
          type="checkbox"
          ref={menuToggleRef}
        />
        <label htmlFor="menu_toggle">
          <span className="material-symbols-rounded" id="icon_menu">
            menu
          </span>
          <span className="material-symbols-rounded" id="icon_close">
            close
          </span>
        </label>
        <div className={menu}>{generateNav(root, menuToggleRef)}</div>
      </nav>
    </>
  );
}

const query = graphql`
  query Navbar {
    allSitePage(sort: { path: ASC }) {
      nodes {
        path
      }
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`;
