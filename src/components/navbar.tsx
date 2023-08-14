import { unslugify } from "@/script/utils/strings";
import { bodyMedium } from "@/styles/main.module.css";
import {
  menu,
  menu_toggle,
  navbar,
  submenu_toggle,
} from "@/styles/navbar.module.css";
import { Link, graphql, useStaticQuery } from "gatsby";
import React, { useRef } from "react";

type Directory = {
  name?: string;
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
) {
  return (
    <ul style={{ "--delay": ".5s" } as CSSPropertiesExtended}>
      {parent.child.map((child, i) => {
        return (
          <li
            key={child.name}
            style={
              {
                "--delay": `${(0.5 * i) / parent.child.length}s`,
                "--color": `lch(var(--tone-container) 50 ${
                  (360 * i) / parent.child.length
                })`,
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
                  id={child.name}
                  className={submenu_toggle}
                  type="checkbox"
                />
                <label htmlFor={child.name}>
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
                  {generateNav(child, menuToggle)}
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
  const menuToggle = useRef<HTMLInputElement>(null);
  const data = useStaticQuery<Queries.NavbarQuery>(query);
  const paths = data.allSitePage.nodes.map(
    (node) => node.path.match(/^\/(.*?)(\.html|\/|)$/)![1],
  );
  const map = new Map<string, Directory>();
  const root: Directory = {
    child: [],
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
          className={menu_toggle}
          type="checkbox"
          ref={menuToggle}
        />
        <label htmlFor="menu_toggle">
          <span className="material-symbols-rounded" id="icon_menu">
            menu
          </span>
          <span className="material-symbols-rounded" id="icon_close">
            close
          </span>
        </label>
        <div className={menu}>{generateNav(root, menuToggle)}</div>
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
