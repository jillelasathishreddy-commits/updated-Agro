import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bottom-nav-safe">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
