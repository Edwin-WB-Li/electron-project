import type { RouteObject } from "@/router/types";

import React from "react";

import lazyLoad from "@/router/LazyLoad";

import Layout from "@/layouts";

// 常用组件模块
const HomeRouter: Array<RouteObject> = [
  {
    element: <Layout />,
    children: [
      {
        path: "/about",
        element: lazyLoad(React.lazy(() => import("@/pages/about/About"))),
        meta: {
          requiresAuth: true,
          title: "关于",
          key: "about",
        },
      },
    ],
    meta: {
      title: "关于",
    },
  },
];

export default HomeRouter;
