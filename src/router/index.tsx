import type { RouteObject } from "@/router/types";

import { Navigate, useRoutes } from "react-router";

// * 导入所有router
const metaRouters = import.meta.glob("./modules/*.tsx", { eager: true });

// * 处理路由
export const routerArray: RouteObject[] = [];
Object.keys(metaRouters).forEach((item) => {
  const module = metaRouters[item] as { [key: string]: RouteObject[] };
  Object.keys(module).forEach((key: string) => {
    routerArray.push(...module[key]);
  });
});

console.log("routerArray:", routerArray);

export const rootRouter: RouteObject[] = [
  ...routerArray,
  {
    path: "*",
    element: <Navigate to="/404" />,
  },
];

const Router = () => {
  return useRoutes(rootRouter);
};

export default Router;
