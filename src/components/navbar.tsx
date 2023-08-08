import {
  menu,
  menu_toggle,
  navbar,
  submenu,
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
                  <svg preserveAspectRatio="xMinYMin" viewBox="0 0 24 24">
                    <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path>
                  </svg>
                  <svg preserveAspectRatio="xMinYMin" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
                  </svg>
                </label>
                <div
                  className={submenu}
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
      path += "/" + name;
      let node = map.get(path);
      if (!node) {
        map.set(
          path,
          (node = {
            name,
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
          <svg preserveAspectRatio="xMinYMin" viewBox="0 0 24 24">
            <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path>
          </svg>
          <svg preserveAspectRatio="xMinYMin" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
          </svg>
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
