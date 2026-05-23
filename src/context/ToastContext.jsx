import { createContext, useContext } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const success = (message, duration = 3000) =>
    toast.success(message, { autoClose: duration });
  const error = (message, duration = 3000) =>
    toast.error(message, { autoClose: duration });
  const info = (message, duration = 3000) =>
    toast.info(message, { autoClose: duration });
  const warning = (message, duration = 3000) =>
    toast.warning(message, { autoClose: duration });

  const value = {
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={4}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export default ToastContext;
