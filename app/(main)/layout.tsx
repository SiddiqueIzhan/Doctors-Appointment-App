import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <div className="container mx-auto my-20 px-20  ">{children}</div>;
};

export default MainLayout;
