import { useMemo } from "react";
import { useSidebar } from "./context/SidebarContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import {
  DashboardIcon,
  SettingsIcon,
  TemplatesIcon,
  UsersIcon,
  LogoutIcon,
} from "../../../../assets/icons";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (!path) return false;
    // For templates, also match child routes like /admin/templates/builder
    if (path === "/admin/templates") {
      return location.pathname.startsWith("/admin/templates");
    }
    // Exact match for other paths
    return location.pathname === path;
  };

  const menuItems = useMemo(
    () => [
      {
        icon: <DashboardIcon className="w-5 h-5" />,
        name: "Dashboard",
        path: "/admin",
      },
      {
        icon: <UsersIcon className="w-5 h-5" />,
        name: "Users",
        path: "/admin/users",
      },
      {
        icon: <TemplatesIcon className="w-5 h-5" />,
        name: "Templates",
        path: "/admin/templates",
      },
      {
        icon: <SettingsIcon className="w-5 h-5" />,
        name: "Settings",
        path: "/admin/settings",
      },
    ],
    [],
  );

  const handleMouseEnter = () => {
    if (!isExpanded) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 bg-white flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200 ${
        isExpanded || isHovered ? "lg:w-65 rounded-lg" : "lg:w-20"
      } ${
        isMobileOpen
          ? "translate-x-0 w-64 rounded-none z-1100 h-[calc(100vh-4rem)]"
          : "-translate-x-full z-1050 h-[calc(100vh-4rem)] lg:translate-x-0 lg:h-screen lg:z-1100"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div
        className={`pt-4 pb-[0.95rem] flex border-b border-gray-200 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/admin" className="px-4">
          <span className="text-2xl">🎨</span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-bold text-xl text-gray-900 ml-2">
              ProfileCraft
            </span>
          )}
        </Link>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear flex-1 mt-4 mb-4 px-3">
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
              >
                <span className="text-xl">{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="font-semibold text-md">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <div className="mt-auto border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors ${
            !isExpanded && !isHovered ? "lg:justify-center" : ""
          }`}
        >
          <LogoutIcon className="w-5 h-5" />
          {(isExpanded || isHovered || isMobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
