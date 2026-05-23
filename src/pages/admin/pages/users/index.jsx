import { useEffect, useState, useCallback } from "react";
import usersAPI from "../../../../api/users";
import { toast } from "react-toastify";
import Pagination from "../../../../components/Pagination";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = search.trim();
      setAppliedSearch(next);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({
        page,
        per_page: perPage,
        search: appliedSearch,
      });
      const data = response.data.data;
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch users");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, appliedSearch]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      setActionLoading(userId);
      await usersAPI.toggleStatus(userId, newStatus);
      toast.success(
        newStatus
          ? "User activated successfully"
          : "User deactivated successfully",
      );
      fetchUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update user status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Users Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor all registered users.
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-gray-200 flex flex-col py-6 text-gray-700 text-sm shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-6 border-b border-gray-200 px-4">
          <div className="flex flex-row items-center">
            <h4 className="text-gray-900 font-semibold">All Users</h4>
            <span className="text-sm text-indigo-600 border border-gray-200 rounded-lg px-1 py-0.5 mt-1 ms-2">
              {total}
            </span>
          </div>
          <div className="w-full md:w-80 me-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setAppliedSearch(search.trim());
                  setPage(1);
                }
              }}
              placeholder="Search users..."
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-full min-w-3xl">
            <thead className="text-gray-700">
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold">
                  Joined
                </th>
                <th className="py-4 px-4 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 mt-3">Loading...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {u.full_name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">
                        {u.full_name || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{u.email || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(u.created_at)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                        onClick={() => handleToggleStatus(u.id, !u.is_active)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id
                          ? "Processing..."
                          : u.is_active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 px-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
