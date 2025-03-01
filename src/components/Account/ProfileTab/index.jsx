"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import supabase from "@/app/utils/db";
import { notification } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import logActivity from "@/components/Admin/ActivityLog/Login";

const ProfileSettings = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    status: "",
    profile_image_url: "",
  });
  const [errors, setErrors] = useState({});

  function getInitials(name) {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else {
      return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    }
  }

  // Fetch user data from database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setProfileData({
            name: data.name,
            username: data.username,
            email: data.email,
            status: data.role,
            profile_image_url: data.profile_image_url,
          });

          // Set image preview if user has a profile image
          if (data.profile_image_url) {
            setImagePreview(data.profile_image_url);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        notification.error({
          message: "Error",
          description: "Gagal memuat data pengguna",
          placement: "top",
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size - 1MB = 1048576 bytes
      if (file.size > 1048576) {
        notification.error({
          message: "Error",
          description: "The file size must not exceed 1MB!",
          placement: "top",
          duration: 3,
        });
        // Reset file input
        e.target.value = "";
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
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

    // Validate name
    if (!profileData.name) {
      newErrors.name = "Profile name is required";
    } else if (profileData.name.length < 4) {
      newErrors.name = "Profile name must be at least 4 characters";
    }

    // Validate username
    if (!profileData.username) {
      newErrors.username = "Username is required";
    } else if (profileData.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadProfileImage = async (userId) => {
    if (!imageFile) return profileData.profile_image_url;

    try {
      // Create a unique file name
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleDeleteImage = async () => {
    setImagePreview(null);
    setImageFile(null);

    // If there was a previously saved image, we'll set it to null during submission
    setProfileData({
      ...profileData,
      profile_image_url: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User ID is missing");
      }

      // Upload image if a new one was selected
      let profileImageUrl = profileData.profile_image_url;
      if (imageFile) {
        profileImageUrl = await uploadProfileImage(userId);
      } else if (profileData.profile_image_url === null) {
        // Handle deleted profile image if needed
      }

      const updateData = {
        name: profileData.name,
        username: profileData.username,
        profile_image_url: profileImageUrl,
      };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (error) {
        throw new Error(error.message);
      }

      notification.success({
        message: "Berhasil",
        description: "Profile berhasil diperbarui",
        placement: "top",
        duration: 5,
      });

      // Update local state
      setProfileData({
        ...profileData,
        profile_image_url: profileImageUrl,
      });

      // Menggunakan Axios untuk mengambil User-Agent
      const response = await axios.get("/api/user-agent");
      const userAgent = response.data?.userAgent || "Unknown";

      const getBrowserName = (userAgent) => {
        if (
          userAgent.includes("Chrome") &&
          !userAgent.includes("Edg") &&
          !userAgent.includes("OPR")
        ) {
          return "Google Chrome";
        } else if (userAgent.includes("Firefox")) {
          return "Mozilla Firefox";
        } else if (
          userAgent.includes("Safari") &&
          !userAgent.includes("Chrome")
        ) {
          return "Apple Safari";
        } else if (userAgent.includes("Edg")) {
          return "Microsoft Edge";
        } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
          return "Opera";
        } else {
          return "Browser Tidak Dikenal";
        }
      };

      await logActivity({
        idUser: userId,
        role: session?.user?.role,
        action: "Change Profile",
        detail: "Profile changed",
        userAgent: getBrowserName(userAgent),
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat memperbarui profile",
        placement: "top",
        duration: 3,
      });
    } finally {
      setSubmitting(false);
      router.refresh();
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-screen-lg mx-auto p-2">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div>
            <h3 className="text-sm font-medium mb-2">Profile picture</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-500 flex items-center justify-center pb-0.5">
                      <span className="text-xl text-white">
                        {getInitials(profileData.name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm">
                    Change picture
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-600 py-2 px-2 text-sm"
                  onClick={handleDeleteImage}
                  disabled={!imagePreview}
                >
                  Delete picture
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maksimal ukuran file: 1MB
              </p>
            </div>
          </div>

          {/* Profile Name */}
          <div>
            <h3 className="text-sm font-medium mb-2">Profile name</h3>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className={`ml-0.5 w-full p-2 border dark:bg-transparent rounded-md ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <h3 className="text-sm font-medium mb-2">Username</h3>
            <div
              className={`flex items-center w-full p-2 border rounded-md dark:bg-transparent ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            >
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                className="ml-0.5 w-full bg-transparent outline-none"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <h3 className="text-sm font-medium mb-2">Email</h3>
            <div className="flex items-center w-full p-2 border border-gray-300 rounded-md text-zinc-700 dark:text-zinc-500 bg-zinc-200 dark:bg-transparent cursor-not-allowed">
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="ml-0.5 w-full bg-transparent outline-none cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-sm mt-1 text-gray-600">Must contact the admin</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium mb-2">Role</h3>
            <div>{profileData.status}</div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-start">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-md disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
