import { ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Compass, ShoppingBag, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Home", icon: Home, path: "/home" },
  { label: "Discover", icon: Compass, path: "/discover" },
  { label: "Orders", icon: ShoppingBag, path: "/orders" },
  { label: "Profile", icon: User, path: "/dashboard" },
] as const;

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-ivoryCream flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-earthBrown shadow-md">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex items-center gap-2"
          >
            <img
              src="/assets/generated/logo-mark.dim_256x256.png"
              alt="SamriddhiSrot"
              className="w-8 h-8 object-contain rounded-full"
            />
            <span className="font-poppins font-bold text-sandGold text-lg tracking-wide">
              समृद्धिस्रोत
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/orders" })}
              className="text-ivoryCream hover:text-sandGold transition-colors"
              aria-label="Orders"
            >
              <ShoppingBag size={22} />
            </button>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-ivoryCream hover:text-sandGold transition-colors"
              aria-label="Profile"
            >
              <User size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto flex">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = currentPath === path || (path === "/home" && currentPath === "/");
            return (
              <button
                key={path}
                onClick={() => navigate({ to: path })}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive
                    ? "text-earthBrown"
                    : "text-gray-400 hover:text-earthBrown"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-xs font-poppins ${isActive ? "font-semibold" : "font-normal"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
