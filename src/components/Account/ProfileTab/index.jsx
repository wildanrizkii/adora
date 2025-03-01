"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import supabase from "@/app/utils/db";
import { notification } from "antd";
import { useRouter } from "next/navigation";

const ProfileSettings = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    status: "",
  });

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
          });
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User ID is missing");
      }

      const updateData = {
        name: profileData.name,
        username: profileData.username,
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

      // No need to refresh the session - data is already fetched from the database
    } catch (err) {
      console.error("Error updating profile:", err);
      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat memperbarui profile",
        placement: "top",
        duration: 3,
      });
    } finally {
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
                    <div className="h-full w-full bg-rose-200 flex items-center justify-center pb-0.5">
                      <span className="text-xl">
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
                  onClick={() => setImagePreview(null)}
                >
                  Delete picture
                </button>
              </div>
            </div>
          </div>

          {/* Rest of your form remains the same */}
          {/* Profile Name */}
          <div>
            <h3 className="text-sm font-medium mb-2">Profile name</h3>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="ml-0.5 w-full p-2 border dark:bg-transparent border-gray-300 rounded-md"
            />
          </div>

          {/* Username */}
          <div>
            <h3 className="text-sm font-medium mb-2">Username</h3>
            <div className="flex items-center w-full p-2 border border-gray-300 rounded-md dark:bg-transparent">
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                className="ml-0.5 w-full bg-transparent outline-none"
              />
            </div>
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
            className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded-md"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
