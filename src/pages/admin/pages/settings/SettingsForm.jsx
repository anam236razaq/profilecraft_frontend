import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";
import { authAPI } from "../../../../api/auth";

const SettingsForm = ({ containerClassName = "" }) => {
  const { user, setUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedAvatar(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", profile.name);
      formData.append("email", profile.email);
      if (selectedAvatar) {
        formData.append("avatar", selectedAvatar);
      }

      const response = await authAPI.updateProfile(formData);
      setUser(response.data.data);
      setSelectedAvatar(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      // Only show error toast if the request actually failed
      if (!err.response || err.response.status >= 400) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update profile";
        toast.error(errorMessage);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.updatePassword({
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });
      toast.success("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={containerClassName}>
      <div className="w-full mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your profile and account settings
          </p>
        </div>

        <div className="relative w-full h-64 mb-6 shadow-lg rounded-xl">
          <div className="absolute h-42 inset-0 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl" />

          <div className="absolute bottom-5 left-8 z-10">
            <label className="relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {selectedAvatar ? (
                <div className="w-35 h-35 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  <img
                    src={URL.createObjectURL(selectedAvatar)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : user?.avatar_url ? (
                <div className="w-35 h-35 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-35 h-35 rounded-full border-4 border-white bg-indigo-600 overflow-hidden shadow-lg flex items-center justify-center">
                  <span className="text-white text-6xl font-medium text-center">
                    {user?.full_name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Profile Settings & Change Password - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 lg:pb-0">
          {/* Profile Settings - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-gray-900 mb-0">
                Profile Settings
              </h5>
            </div>
            <div className="p-6 bg-gray-50">
              <form className="space-y-4" onSubmit={handleUpdateProfile}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password - Takes 1 column */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-gray-900 mb-0">
                Change Password
              </h5>
            </div>
            <div className="p-6 bg-gray-50">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
