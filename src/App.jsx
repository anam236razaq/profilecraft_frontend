import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import MainLayout from "./pages/admin/layout/main";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SkeletonPage } from "./components/Skeleton";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Websites from "./pages/websites/Websites";
import ViewWebsite from "./pages/websites/ViewWebsite";
import CreateWebsite from "./pages/CreateWebsite";
import Templates from "./pages/templates/Templates";
import ViewTemplate from "./pages/templates/ViewTemplate";
import SocialAccounts from "./pages/SocialAccounts";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/admin/pages/dashboard";
import AdminUsers from "./pages/admin/pages/users";
import AdminTemplates from "./pages/admin/pages/templates";
import AdminSettings from "./pages/admin/pages/settings";
import TemplateBuilder from "./pages/admin/pages/templates/builder";

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <SkeletonPage />;
  }

  // Determine redirect path based on user type
  const getHomeRoute = () => {
    if (isAdmin) return "/admin";
    return "/";
  };

  return (
    <Routes>
      {/* Home page - always public, shows to everyone */}
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getHomeRoute()} /> : <Login />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to={getHomeRoute()} /> : <Register />
        }
      />

      {/* Regular user routes - redirect to Home */}
      <Route
        path="/websites"
        element={
          isAuthenticated && !isAdmin ? (
            <Layout>
              <Websites />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/websites/new"
        element={
          isAuthenticated && !isAdmin ? (
            <Layout>
              <CreateWebsite />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/websites/:id/view"
        element={
          isAuthenticated && !isAdmin ? (
            <Layout>
              <ViewWebsite />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      {/* Preview route - no navbar/footer for clean viewing */}
      <Route
        path="/preview/:id"
        element={
          isAuthenticated && !isAdmin ? <ViewWebsite /> : <Navigate to="/" />
        }
      />
      {/* Public templates route - accessible to everyone */}
      <Route
        path="/templates"
        element={
          <Layout>
            <Templates />
          </Layout>
        }
      />
      <Route
        path="/templates/:id"
        element={
          isAuthenticated && !isAdmin ? (
            <Layout>
              <ViewTemplate />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/social-accounts"
        element={
          isAuthenticated && !isAdmin ? (
            <Layout>
              <SocialAccounts />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Layout>
              <Settings />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/pricing"
        element={
          <Layout>
            <Pricing />
          </Layout>
        }
      />

      {/* Admin routes - use MainLayout which includes sidebar (no Navbar/Footer) */}
      <Route path="/admin" element={<MainLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="templates/builder" element={<TemplateBuilder />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
