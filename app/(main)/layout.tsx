import { LayoutRoutes } from "@/.next/dev/types/routes";
import React from "react";

const MainLayout = ({ children }: LayoutProps<LayoutRoutes>) => {
  return <div className="container mx-auto my-28 px-20">{children}</div>;
};

export default MainLayout;
