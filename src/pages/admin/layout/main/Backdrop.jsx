import { useSidebar } from "./context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      onClick={toggleMobileSidebar}
      className="fixed inset-0 bg-gray-900/50 z-1050 lg:hidden"
    />
  );
};

export default Backdrop;
