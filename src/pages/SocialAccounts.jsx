import { useState, useEffect, useCallback } from "react";
import socialAPI from "../api/social";
import { toast } from "react-toastify";
import { SkeletonText } from "../components/Skeleton";
import {
  GitHubIcon,
  LinkedInIcon,
  GoogleIcon,
  LinkIcon,
  SyncIcon,
} from "../assets/icons";

const SocialAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [disconnectModal, setDisconnectModal] = useState({
    show: false,
    account: null,
  });
  const [syncing, setSyncing] = useState(null);
  const [recentlySynced, setRecentlySynced] = useState(null);

  const providers = [
    { id: "github", name: "GitHub", Icon: GitHubIcon, color: "#333" },
    { id: "linkedin", name: "LinkedIn", Icon: LinkedInIcon, color: "#0A66C2" },
    { id: "google", name: "Google", Icon: GoogleIcon, color: "#1A73E8" },
  ];

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await socialAPI.getAll();
      setAccounts(response.data.data || []);
    } catch {
      console.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Use queueMicrotask to defer execution and avoid cascading renders warning
    queueMicrotask(() => fetchAccounts());
  }, [fetchAccounts]);

  const handleConnect = async (provider) => {
    try {
      setConnecting(provider);
      const response = await socialAPI.connect(provider);
      const { auth_url } = response.data.data || {};

      if (auth_url) {
        // Open OAuth URL in a popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          auth_url,
          "oauth",
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
        );

        if (!popup) {
          // Fallback if popup is blocked - redirect in same window
          window.location.replace(auth_url);
          return;
        }

        // Check popup closed and refresh accounts list
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            fetchAccounts(); // Refresh accounts list
            setConnecting(null);
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          popup.close();
          setConnecting(null);
        }, 300000);
      } else {
        alert("Failed to get authorization URL");
        setConnecting(null);
      }
    } catch (err) {
      console.error("Failed to connect:", err);
      alert(
        "Failed to connect social account: " +
          (err?.response?.data?.message || err.message),
      );
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id) => {
    const account = accounts.find((a) => a.id === id);
    setDisconnectModal({ show: true, account });
  };

  const confirmDisconnect = async () => {
    const { account } = disconnectModal;
    if (!account) return;
    try {
      await socialAPI.disconnect(account.id);
      setAccounts(accounts.filter((a) => a.id !== account.id));
      setDisconnectModal({ show: false, account: null });
      toast.success("Account has been disconnected");
    } catch {
      toast.error("Failed to disconnect account");
    }
  };

  const handleSync = async (id) => {
    if (syncing === id) return;
    try {
      setSyncing(id);
      await socialAPI.sync(id);
      toast.success("Account has been synced successfully");
      setRecentlySynced(id);
      setTimeout(() => setRecentlySynced(null), 2000);
      fetchAccounts();
    } catch {
      toast.error("Failed to sync account");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-12 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Connected Accounts
          </h1>
          <p className="text-gray-500 mt-1">
            Link your social media accounts to import content
          </p>
        </div>

        {/* Connect New */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Connect a New Account
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {providers.map((provider) => {
              // Google stores numeric-only user IDs; other providers use string IDs
              const isGoogleByUserId = (a) =>
                a.provider_user_id && /^\d+$/.test(a.provider_user_id);
              const connected = accounts.some(
                (a) =>
                  (a.provider === provider.id ||
                    (provider.id === "google" &&
                      (a.provider === "google" || isGoogleByUserId(a)))) &&
                  a.is_connected,
              );
              const IconComponent = provider.Icon;

              return (
                <div
                  key={provider.id}
                  className={`flex flex-col items-center p-4 rounded-xl border ${
                    connected
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: provider.color }}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 mb-2">
                    {provider.name}
                  </span>
                  {connected ? (
                    <span className="text-xs text-green-600 font-medium block">
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={connecting === provider.id}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {connecting === provider.id ? "..." : "Connect"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Your Connected Accounts
          </h2>
          {loading ? (
            <div className="space-y-4">
              <SkeletonText lines={2} />
              <SkeletonText lines={2} />
              <SkeletonText lines={2} />
            </div>
          ) : accounts.filter((a) => a.is_connected).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No accounts connected
              </h3>
              <p className="text-gray-500">
                Connect your social media accounts above to import content
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts
                .filter((a) => a.is_connected)
                .map((account) => {
                  const isGoogleByUserId =
                    account.provider_user_id &&
                    /^\d+$/.test(account.provider_user_id);
                  const provider = providers.find(
                    (p) =>
                      p.id === account.provider ||
                      (p.id === "google" && isGoogleByUserId),
                  );
                  const IconComponent = provider?.Icon;
                  return (
                    <div
                      key={account.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-green-300 bg-green-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        {IconComponent && (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: provider?.color }}
                          >
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {account.provider_username || provider?.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize truncate block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {account.provider}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-medium text-green-600">
                              Connected
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-start sm:ml-auto sm:justify-end">
                        <button
                          onClick={() => handleSync(account.id)}
                          disabled={syncing === account.id}
                          className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium rounded-lg transition ${
                            recentlySynced === account.id
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } ${syncing === account.id ? "opacity-50" : ""}`}
                        >
                          {syncing === account.id ? (
                            <>
                              <SyncIcon className="w-4 h-4 animate-spin" />{" "}
                              Syncing
                            </>
                          ) : recentlySynced === account.id ? (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Synced
                            </>
                          ) : (
                            <>
                              <SyncIcon className="w-4 h-4" /> Sync
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDisconnect(account.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* Disconnect Confirmation Modal */}
      {disconnectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Disconnect Account
            </h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to disconnect this account? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() =>
                  setDisconnectModal({ show: false, account: null })
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAccounts;
