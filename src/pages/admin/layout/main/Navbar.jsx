import { useSidebar } from "./context/SidebarContext";
import { useAuth } from "../../../../context/AuthContext";
import { MenuIcon, CloseIcon } from "../../../../assets/icons";

const Navbar = () => {
  const { toggleSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-1100 h-16">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            onClick={handleToggle}
            className={`flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg z-99999 lg:h-11 lg:w-11 ${
              isMobileOpen ? "lg:bg-transparent bg-gray-100" : ""
            }`}
          >
            {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* Mobile Logo */}
          <div className="flex justify-center flex-1 lg:hidden">
            <span className="text-2xl">🎨</span>
            <span className="font-bold text-xl text-gray-900">
              ProfileCraft
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-9 h-9 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-sm font-semibold text-gray-800">
                {user?.full_name || "Admin"}
              </span>
            </div>
          </div>
        </div>
        {/* User Info */}
      </div>
    </header>
  );
};

export default Navbar;
