import { useCatppuccin } from "@/hooks/use-catppuccin";
import { fpart } from "@/script/utils/math";
import { unslugify } from "@/script/utils/strings";
import { bodyMedium } from "@/styles/main.module.scss";
import {
  menu,
  menuToggle,
  navbar,
  submenuToggle,
} from "@/styles/navbar.module.scss";
import * as color from "@thi.ng/color";
import { Link, graphql, useStaticQuery } from "gatsby";
import React, { memo, useMemo, useRef } from "react";

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
  gradient: string[],
  initialHue: number = 0,
) {
  return (
    <ul style={{ "--delay": ".5s" } as CSSPropertiesExtended}>
      {parent.child
        .sort((a, b) => a.path.localeCompare(b.path))
        .map((child, i) => {
          const curr_hue = fpart(initialHue + (i + 0.5) / parent.child.length);
          return (
            <li
              key={child.name}
              style={
                {
                  "--delay": `${(0.5 * i) / parent.child.length}s`,
                  "--color": gradient[Math.round(curr_hue * gradient.length)],
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
                    {generateNav(child, menuToggle, gradient, curr_hue)}
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

export const Navbar = memo(function Navbar() {
  const data = useStaticQuery<Queries.NavbarQuery>(query);
  const menuToggleRef = useRef<HTMLInputElement>(null);
  const root = useMemo(() => {
    const paths = data.allMdx.nodes
      .map((node) => ({
        path:
          node.frontmatter?.slug?.match(/^\/(.*?)(\.html|\/|)$/)?.[1] ?? "_",
        type: node.frontmatter?.type ?? "Published",
      }))
      .filter(({ path }) => path !== "_");
    const map = new Map<string, Directory>();
    const root: Directory = {
      name: "",
      child: [],
      path: "/",
    };
    for (const { path: route, type } of paths) {
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
              name: unslugify(name) + (type === "WIP" ? " (WIP)" : ""),
              path: path,
              parent,
              child: [],
            }),
          );
          node.name ||= data.site!.siteMetadata!.title ?? "Home";
          parent.child.push(node);
        }
        parent = node;
      }
      parent.href = type === "WIP" ? `/WIP/${route}` : `/${route}`;
    }
    return root;
  }, [data]);

  const gradient = color
    .multiColorGradient({
      num: 90,
      stops: [
        [0 / 15, color.oklab(useCatppuccin("rosewater"))],
        [1 / 15, color.oklab(useCatppuccin("flamingo"))],
        [2 / 15, color.oklab(useCatppuccin("pink"))],
        [3 / 15, color.oklab(useCatppuccin("mauve"))],
        [4 / 15, color.oklab(useCatppuccin("red"))],
        [5 / 15, color.oklab(useCatppuccin("maroon"))],
        [6 / 15, color.oklab(useCatppuccin("peach"))],
        [7 / 15, color.oklab(useCatppuccin("yellow"))],
        [8 / 15, color.oklab(useCatppuccin("green"))],
        [9 / 15, color.oklab(useCatppuccin("teal"))],
        [10 / 15, color.oklab(useCatppuccin("sky"))],
        [11 / 15, color.oklab(useCatppuccin("sapphire"))],
        [12 / 15, color.oklab(useCatppuccin("blue"))],
        [13 / 15, color.oklab(useCatppuccin("lavender"))],
        [14 / 15, color.oklab(useCatppuccin("text"))],
        [15 / 15, color.oklab(useCatppuccin("rosewater"))],
      ],
    })
    .map((c) => color.css(c));

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
        <div className={menu}>{generateNav(root, menuToggleRef, gradient)}</div>
      </nav>
    </>
  );
});
export default Navbar;

const query = graphql`
  query Navbar {
    allMdx(sort: { frontmatter: { slug: ASC } }) {
      nodes {
        frontmatter {
          slug
          type
        }
      }
    }
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
