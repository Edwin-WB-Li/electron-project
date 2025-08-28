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
        path: "/",
        element: lazyLoad(React.lazy(() => import("@/pages/home/Home"))),
        meta: {
          requiresAuth: true,
          title: "首页",
          key: "home",
        },
      },
    ],
    meta: {
      title: "首页",
    },
  },
];

export default HomeRouter;
