"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import supabase from "@/app/utils/db";
import { notification } from "antd";
import { useRouter } from "next/navigation";
import { Input, Button } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const PasswordChangeForm = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});

  const getWIBTime = () => {
    return dayjs().tz("Asia/Jakarta").format("DD MMM YYYY HH:mm");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User ID is missing");
      }

      setLoading(true);

      // Fetch the current password hash from the database
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("password") // Adjust field name as needed
        .eq("id", userId)
        .single();

      if (fetchError) {
        throw new Error("Failed to verify current password");
      }

      // Verify the current password using bcrypt
      const isCurrentPasswordValid = await bcrypt.compare(
        passwordData.currentPassword,
        userData.password
      );

      if (!isCurrentPasswordValid) {
        setErrors({
          ...errors,
          currentPassword: "Current password is incorrect",
        });
        setLoading(false);
        return;
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(
        passwordData.newPassword,
        saltRounds
      );

      // Update the password in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({
          password: hashedNewPassword,
          updated_at: getWIBTime(),
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      notification.success({
        message: "Berhasil",
        description: "Password berhasil diperbarui",
        placement: "top",
        duration: 5,
      });

      // Reset form after successful update
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      console.error("Error updating password:", err);

      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat memperbarui password",
        placement: "top",
        duration: 3,
      });
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto p-2">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <p className="text-sm text-gray-600">
          Update your password to keep your account secure
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <h3 className="text-sm font-medium mb-2">Current Password</h3>
            <div className="relative">
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md dark:bg-transparent ${
                  errors.currentPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>
          </div>

          {/* New Password */}
          <div>
            <h3 className="text-sm font-medium mb-2">New Password</h3>
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md dark:bg-transparent ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <p className="text-sm mt-1 text-gray-600">
              Must be at least 6 characters
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <h3 className="text-sm font-medium mb-2">Confirm New Password</h3>
            <div className="relative">
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md dark:bg-transparent ${
                  errors.confirmNewPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-start">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
