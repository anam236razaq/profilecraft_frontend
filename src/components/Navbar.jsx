import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  HomeIcon,
  TemplatesIcon,
  PricingIcon,
  DashboardIcon,
  WebsitesIcon,
  SocialIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
  LogoutIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../assets/icons";

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const userMenuRef = useRef(null);

  // Fetch current plan on mount
  useEffect(() => {
    if (isAuthenticated) {
      api.get("/stripe/subscription")
        .then(res => res.data)
        .then(data => {
          if (data.success && data.data?.plan) {
            setCurrentPlan(data.data.plan);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Helper to check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate("/");
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation link styles - base and active
  const getNavLinkClass = (path) => {
    const baseClass = "font-medium transition-colors";
    if (isActive(path)) {
      return `${baseClass} text-indigo-600`;
    }
    return `${baseClass} text-gray-600 hover:text-gray-900`;
  };

  const getMobileNavLinkClass = (path) => {
    const baseClass =
      "flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors";
    if (isActive(path)) {
      return `${baseClass} bg-indigo-50 text-indigo-600`;
    }
    return `${baseClass} text-gray-700 hover:bg-gray-100`;
  };

  return (
    <>
      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer - Right Side */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-70 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2"
            >
              <span className="text-xl">🎨</span>
              <span className="font-bold text-lg text-gray-900">
                ProfileCraft
              </span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name}
                      {isAdmin && (
                        <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/admin")}
                      >
                        <DashboardIcon className="w-5 h-5 mr-3" />
                        Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/admin/users")}
                      >
                        <WebsitesIcon className="w-5 h-5 mr-3" />
                        Manage Users
                      </Link>
                      <Link
                        to="/admin/templates"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/admin/templates")}
                      >
                        <TemplatesIcon className="w-5 h-5 mr-3" />
                        Manage Templates
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/admin/settings")}
                      >
                        <SettingsIcon className="w-5 h-5 mr-3" />
                        Admin Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/" className={getMobileNavLinkClass("/")}>
                        <HomeIcon className="w-5 h-5 mr-3" />
                        Home
                      </Link>
                      <Link
                        to="/templates"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/templates")}
                      >
                        <TemplatesIcon className="w-5 h-5 mr-3" />
                        Templates
                      </Link>
                      <Link
                        to="/pricing"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/pricing")}
                      >
                        <PricingIcon className="w-5 h-5 mr-3" />
                        Pricing
                      </Link>
                      <Link
                        to="/social-accounts"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/social-accounts")}
                      >
                        <SocialIcon className="w-5 h-5 mr-3" />
                        Social
                      </Link>
                      <Link
                        to="/websites"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/websites")}
                      >
                        <WebsitesIcon className="w-5 h-5 mr-3" />
                        Websites
                      </Link>
                      <Link
                        to="/settings"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass("/settings")}
                      >
                        <SettingsIcon className="w-5 h-5 mr-3" />
                        Settings
                      </Link>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className={getMobileNavLinkClass("/")}
                >
                  <HomeIcon className="w-5 h-5 mr-3" />
                  Home
                </Link>
                <Link
                  to="/templates"
                  onClick={closeMobileMenu}
                  className={getMobileNavLinkClass("/templates")}
                >
                  <TemplatesIcon className="w-5 h-5 mr-3" />
                  Templates
                </Link>
                <Link
                  to="/pricing"
                  onClick={closeMobileMenu}
                  className={getMobileNavLinkClass("/pricing")}
                >
                  <PricingIcon className="w-5 h-5 mr-3" />
                  Pricing
                </Link>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-4 border-t border-gray-200">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg font-medium transition-colors"
              >
                <LogoutIcon className="w-5 h-5 mr-2" />
                Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className={`block w-full px-4 py-2.5 text-center font-medium rounded-lg transition-colors ${
                    isActive("/login")
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                      : "text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className={`block w-full px-4 py-2.5 text-center font-medium rounded-lg transition-colors ${
                    isActive("/register")
                      ? "bg-indigo-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-30 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <span className="font-bold text-xl text-gray-900">
                  ProfileCraft
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-8">
              {isAuthenticated ? (
                isAdmin ? (
                  <>
                    <Link to="/admin" className={getNavLinkClass("/admin")}>
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      className={getNavLinkClass("/admin/users")}
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/templates"
                      className={getNavLinkClass("/admin/templates")}
                    >
                      Templates
                    </Link>
                    <Link
                      to="/admin/settings"
                      className={getNavLinkClass("/admin/settings")}
                    >
                      Settings
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/" className={getNavLinkClass("/")}>
                      Home
                    </Link>
                    <Link
                      to="/templates"
                      className={getNavLinkClass("/templates")}
                    >
                      Templates
                    </Link>
                    <Link
                      to="/pricing"
                      className={getNavLinkClass("/pricing")}
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/social-accounts"
                      className={getNavLinkClass("/social-accounts")}
                    >
                      Social
                    </Link>
                    <Link
                      to="/websites"
                      className={getNavLinkClass("/websites")}
                    >
                      Websites
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link to="/" className={getNavLinkClass("/")}>
                    Home
                  </Link>
                  <Link
                    to="/templates"
                    className={getNavLinkClass("/templates")}
                  >
                    Templates
                  </Link>
                  <Link to="/pricing" className={getNavLinkClass("/pricing")}>
                    Pricing
                  </Link>
                </>
              )}
            </div>

            {/* Right Side - User Menu Popover */}
            <div className="hidden md:flex items-center" ref={userMenuRef}>
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full"
                  >
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user?.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-base font-medium">
                          {user?.full_name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    {userMenuOpen ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {/* Popover */}
                  {userMenuOpen && (
                    <div className="absolute -right-5 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                            {user?.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user?.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-lg font-medium">
                                {user?.full_name?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user?.full_name}
                              {isAdmin && (
                                <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                            {currentPlan && currentPlan !== "basic" && (
                              <p className="text-xs font-medium text-indigo-600 truncate capitalize">
                                {currentPlan} Plan
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <SettingsIcon className="w-5 h-5 text-gray-500" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-base text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogoutIcon className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`px-6 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive("/login")
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-600"
                        : "text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className={`px-6 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive("/register")
                        ? "bg-indigo-700 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
