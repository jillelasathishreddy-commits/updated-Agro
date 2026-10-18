import { NavLink, useLocation } from "react-router-dom";
import { Home, Leaf, ScanLine, Wrench, User } from "lucide-react";

const navItems = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/crop-tips", icon: Leaf, label: "Crop Tips" },
  { to: "/disease", icon: ScanLine, label: "Detect", center: true },
  { to: "/services", icon: Wrench, label: "Services" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          const Icon = item.icon;

          if (item.center) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center -mt-6"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, hsl(142,60%,40%), hsl(120,45%,45%))"
                      : "linear-gradient(135deg, hsl(142,50%,35%), hsl(120,40%,40%))",
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: "white" }} />
                </div>
                <span className="text-[10px] mt-1 font-semibold" style={{ color: isActive ? "hsl(142,60%,40%)" : "hsl(var(--muted-foreground))" }}>
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: isActive ? "hsl(142,60%,40%)" : "hsl(var(--muted-foreground))" }}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? "hsl(142,60%,40%)" : "hsl(var(--muted-foreground))" }}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full" style={{ background: "hsl(142,60%,40%)" }} />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
