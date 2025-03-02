import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  Store,
  MapPin,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Phone,
  Upload,
  X,
  Check,
  Camera,
  Loader2,
} from "lucide-react";
import supabase from "@/app/utils/db";
import { useSession } from "next-auth/react";
import { notification } from "antd";

const MainStore = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { data: session } = useSession();

  const [newPharmacy, setNewPharmacy] = useState({
    nama_apotek: "",
    logo: "",
    id_user: "",
  });

  const [newBranch, setNewBranch] = useState({
    nama_cabang: "",
    alamat: "",
    telepon: "",
    id_apotek: "",
  });

  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [expandedPharmacy, setExpandedPharmacy] = useState(null);
  const [isAddingPharmacy, setIsAddingPharmacy] = useState(false);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session?.user?.id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (session?.user) {
          setUser(data);
          setNewPharmacy((prev) => ({ ...prev, id_user: session?.user?.id }));
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        setError("Failed to authenticate user. Please log in again.");
      }
    };

    fetchUser();
  }, [session]);

  // Fetch pharmacies and branches when user is available
  useEffect(() => {
    if (!user) return;

    const fetchPharmacies = async () => {
      try {
        setLoading(true);

        // Fetch pharmacies for the current user
        const { data: pharmaciesData, error: pharmaciesError } = await supabase
          .from("apotek")
          .select("*")
          .eq("id_user", user.id);

        if (pharmaciesError) throw pharmaciesError;

        // Create an array to store pharmacies with their branches
        const pharmaciesWithBranches = [];

        // Fetch branches for each pharmacy
        for (const pharmacy of pharmaciesData) {
          const { data: branchesData, error: branchesError } = await supabase
            .from("cabang")
            .select("*")
            .eq("id_apotek", pharmacy.id_apotek);

          if (branchesError) throw branchesError;

          pharmaciesWithBranches.push({
            ...pharmacy,
            branches: branchesData || [],
          });
        }

        setPharmacies(pharmaciesWithBranches);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load pharmacies and branches.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [user, expandedPharmacy]);

  const handleAddPharmacy = async () => {
    if (newPharmacy.nama_apotek.trim() === "" || !user) return;

    try {
      // Insert new pharmacy
      const { data, error } = await supabase
        .from("apotek")
        .insert([
          {
            nama_apotek: newPharmacy.nama_apotek,
            logo: newPharmacy.logo,
            id_user: user.id,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        // Add new pharmacy to state with empty branches array
        const newPharmacyWithBranches = { ...data[0], branches: [] };
        setPharmacies([...pharmacies, newPharmacyWithBranches]);
        setNewPharmacy({ nama_apotek: "", logo: "", id_user: user.id });
        setIsAddingPharmacy(false);
        setExpandedPharmacy(data[0].id_apotek);
      }
    } catch (error) {
      console.error("Error adding pharmacy:", error);
      setError("Failed to add pharmacy.");
    }
  };

  const handleAddBranch = async () => {
    if (newBranch.nama_cabang.trim() === "" || !newBranch.id_apotek) return;

    try {
      // Insert new branch
      const { data, error } = await supabase
        .from("cabang")
        .insert([
          {
            nama_cabang: newBranch.nama_cabang,
            alamat: newBranch.alamat,
            telepon: newBranch.telepon,
            id_apotek: newBranch.id_apotek,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        // Update state with new branch
        const updatedPharmacies = pharmacies.map((pharmacy) => {
          if (pharmacy.id_apotek === newBranch.id_apotek) {
            return {
              ...pharmacy,
              branches: [...pharmacy.branches, data[0]],
            };
          }
          return pharmacy;
        });

        setPharmacies(updatedPharmacies);
        setNewBranch({
          nama_cabang: "",
          alamat: "",
          telepon: "",
          id_apotek: "",
        });
        setIsAddingBranch(false);
      }
    } catch (error) {
      console.error("Error adding branch:", error);
      setError("Failed to add branch.");
    }
  };

  const handleDeletePharmacy = async (id_apotek) => {
    if (!id_apotek) return;

    try {
      // Delete pharmacy by ID
      const { error } = await supabase
        .from("apotek")
        .delete()
        .eq("id_apotek", id_apotek);

      if (error) throw error;

      // Update state after successful deletion
      setPharmacies(
        pharmacies.filter((pharmacy) => pharmacy.id_apotek !== id_apotek)
      );

      // If the deleted pharmacy was expanded, reset expandedPharmacy
      if (expandedPharmacy === id_apotek) {
        setExpandedPharmacy(null);
      }
    } catch (error) {
      console.error("Error deleting pharmacy:", error);
      setError("Failed to delete pharmacy.");
    }
  };

  const handleDeleteBranch = async (id_cabang) => {
    if (!id_cabang) return;

    try {
      // Find the branch's pharmacy ID first
      let pharmacyId = null;
      let branchToDelete = null;

      for (const pharmacy of pharmacies) {
        const branch = pharmacy.branches.find((b) => b.id_cabang === id_cabang);
        if (branch) {
          pharmacyId = pharmacy.id_apotek;
          branchToDelete = branch;
          break;
        }
      }

      if (!pharmacyId || !branchToDelete) return;

      // Delete branch by ID
      const { error } = await supabase
        .from("cabang")
        .delete()
        .eq("id_cabang", id_cabang);

      if (error) throw error;

      // Update state after successful deletion
      const updatedPharmacies = pharmacies.map((pharmacy) => {
        if (pharmacy.id_apotek === pharmacyId) {
          return {
            ...pharmacy,
            branches: pharmacy.branches.filter(
              (branch) => branch.id_cabang !== id_cabang
            ),
          };
        }
        return pharmacy;
      });

      setPharmacies(updatedPharmacies);
    } catch (error) {
      console.error("Error deleting branch:", error);
      setError("Failed to delete branch.");
    }
  };

  const startEditingPharmacy = (pharmacy) => {
    setEditingPharmacy({ ...pharmacy });
  };

  const saveEditedPharmacy = async () => {
    if (!editingPharmacy || editingPharmacy.nama_apotek.trim() === "") return;

    try {
      // Update pharmacy in the database
      const { error } = await supabase
        .from("apotek")
        .update({
          nama_apotek: editingPharmacy.nama_apotek,
          logo: editingPharmacy.logo,
        })
        .eq("id_apotek", editingPharmacy.id_apotek);

      if (error) throw error;

      // Update state after successful update
      const updatedPharmacies = pharmacies.map((pharmacy) =>
        pharmacy.id_apotek === editingPharmacy.id_apotek
          ? { ...editingPharmacy, branches: pharmacy.branches }
          : pharmacy
      );

      setPharmacies(updatedPharmacies);
      setEditingPharmacy(null);
    } catch (error) {
      console.error("Error updating pharmacy:", error);
      setError("Failed to update pharmacy.");
    }
  };

  const startEditingBranch = (branch) => {
    setEditingBranch({ ...branch });
  };

  const saveEditedBranch = async () => {
    if (!editingBranch || editingBranch.nama_cabang.trim() === "") return;

    try {
      // Update branch in the database
      const { error } = await supabase
        .from("cabang")
        .update({
          nama_cabang: editingBranch.nama_cabang,
          alamat: editingBranch.alamat,
          telepon: editingBranch.telepon,
        })
        .eq("id_cabang", editingBranch.id_cabang);

      if (error) throw error;

      // Update state after successful update
      const updatedPharmacies = pharmacies.map((pharmacy) => {
        if (pharmacy.id_apotek === editingBranch.id_apotek) {
          return {
            ...pharmacy,
            branches: pharmacy.branches.map((branch) =>
              branch.id_cabang === editingBranch.id_cabang
                ? editingBranch
                : branch
            ),
          };
        }
        return pharmacy;
      });

      setPharmacies(updatedPharmacies);
      setEditingBranch(null);
    } catch (error) {
      console.error("Error updating branch:", error);
      setError("Failed to update branch.");
    }
  };

  const togglePharmacyExpand = (id_apotek) => {
    setExpandedPharmacy((prev) => (prev === id_apotek ? null : id_apotek));
  };

  const startAddBranch = (pharmacyId) => {
    setNewBranch({ ...newBranch, id_apotek: pharmacyId });
    setIsAddingBranch(true);
  };

  const handleLogoUpload = async (target, pharmacyId) => {
    if (!fileInputRef.current || !fileInputRef.current.files[0]) return;

    try {
      setUploading(true);
      const file = fileInputRef.current.files[0];

      // Cek ukuran file maksimal 1MB (1048576 bytes)
      if (file.size > 1048576) {
        notification.error({
          message: "Error",
          description: "The file size must not exceed 1MB!",
          placement: "top",
          duration: 3,
        });
        fileInputRef.current.value = ""; // Reset input file
        setUploading(false);
        return;
      }

      // Generate nama file berdasarkan ID apotek
      const fileExt = file.name.split(".").pop();
      const fileName = `${pharmacyId}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload file ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("pharmacy")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil public URL dari file yang diunggah
      const { data } = supabase.storage.from("pharmacy").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update database dengan URL logo baru
      const { error: updateError } = await supabase
        .from("apotek")
        .update({ logo: publicUrl })
        .eq("id_apotek", pharmacyId);

      if (updateError) throw updateError;

      // Update state dengan logo baru
      if (target === "new") {
        setNewPharmacy({ ...newPharmacy, logo: publicUrl });
      } else if (target === "edit" && editingPharmacy) {
        setEditingPharmacy({ ...editingPharmacy, logo: publicUrl });
      }

      notification.success({
        message: "Success",
        description: "Logo updated successfully!",
        placement: "top",
        duration: 3,
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading && pharmacies.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading pharmacy data...</p>
        </div>
      </div>
    );
  }

  if (error && pharmacies.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-red-50 rounded-xl">
        <div className="text-center">
          <h2 className="text-xl font-medium text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-yellow-50 rounded-xl">
        <div className="text-center">
          <h2 className="text-xl font-medium text-yellow-700 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-600">
            Please log in to access your pharmacies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto p-2">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Manage Store</h2>
        <p className="text-sm text-gray-600">
          Manage and update your store details to ensure accurate business
          information
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={() =>
          handleLogoUpload(
            editingPharmacy ? "edit" : "new",
            editingPharmacy?.id_apotek || newPharmacy?.id_apotek
          )
        }
      />

      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
          <button
            className="ml-2 text-red-500 font-medium hover:text-red-700"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Pharmacy Button */}
      <div className="flex justify-end mb-6">
        <button
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => setIsAddingPharmacy(true)}
        >
          <PlusCircle size={18} />
          <span>Tambah Apotek</span>
        </button>
      </div>

      {/* Add Pharmacy Form */}
      {isAddingPharmacy && (
        <div className="mb-6 p-6 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Apotek Baru</h3>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setIsAddingPharmacy(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Apotek
              </label>
              <input
                type="text"
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPharmacy.nama_apotek}
                onChange={(e) =>
                  setNewPharmacy({
                    ...newPharmacy,
                    nama_apotek: e.target.value,
                  })
                }
                placeholder="Masukkan nama apotek"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Apotek
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {newPharmacy.logo ? (
                    <img
                      src={newPharmacy.logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={triggerFileInput}
                  disabled={uploading || !editingPharmacy?.id_apotek} // Cek apakah `id_apotek` ada
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  <span>{uploading ? "Uploading..." : "Ganti Logo"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddPharmacy}
              disabled={uploading || !newPharmacy.nama_apotek.trim()}
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Pharmacy List */}
      <div className="space-y-4">
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id_apotek}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            {editingPharmacy &&
            editingPharmacy.id_apotek === pharmacy.id_apotek ? (
              // Editing pharmacy mode
              <div className="p-5 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Edit Apotek
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={() => setEditingPharmacy(null)}
                    >
                      <X size={20} />
                    </button>
                    <button
                      className="p-1 text-green-500 hover:text-green-600"
                      onClick={saveEditedPharmacy}
                      disabled={uploading}
                    >
                      <Check size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Apotek
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingPharmacy.nama_apotek}
                      onChange={(e) =>
                        setEditingPharmacy({
                          ...editingPharmacy,
                          nama_apotek: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo Apotek
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {editingPharmacy.logo ? (
                          <img
                            src={editingPharmacy.logo}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera size={24} className="text-gray-400" />
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                            <Loader2
                              size={24}
                              className="text-white animate-spin"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={triggerFileInput}
                        disabled={uploading || !editingPharmacy?.id_apotek} // Cek apakah `id_apotek` ada
                      >
                        {uploading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        <span>{uploading ? "Uploading..." : "Ganti Logo"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Normal pharmacy view
              <div
                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => togglePharmacyExpand(pharmacy.id_apotek)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {pharmacy.logo ? (
                      <img
                        src={pharmacy.logo}
                        alt={pharmacy.nama_apotek}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {pharmacy.nama_apotek}
                    </h3>
                    <p className="text-xs text-gray-400">
                      ID: {pharmacy.id_user}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {pharmacy.branches.length} cabang
                  </span>
                  <button
                    className="p-1 text-gray-400 hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingPharmacy(pharmacy);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePharmacy(pharmacy.id_apotek);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedPharmacy === pharmacy.id_apotek ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>
            )}

            {/* Branches */}
            {expandedPharmacy === pharmacy.id_apotek && (
              <div className="p-5 pt-0 border-t border-gray-100">
                <div className="flex justify-between items-center py-4">
                  <h4 className="text-sm font-medium text-gray-700">Cabang</h4>
                  <button
                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                    onClick={() => startAddBranch(pharmacy.id_apotek)}
                  >
                    <PlusCircle size={14} />
                    <span>Tambah Cabang</span>
                  </button>
                </div>

                {/* Add Branch Form */}
                {isAddingBranch &&
                  newBranch.id_apotek === pharmacy.id_apotek && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-700">
                          Cabang Baru
                        </h5>
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setIsAddingBranch(false)}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nama Cabang
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newBranch.nama_cabang}
                            onChange={(e) =>
                              setNewBranch({
                                ...newBranch,
                                nama_cabang: e.target.value,
                              })
                            }
                            placeholder="Masukkan nama cabang"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            No. Telepon
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newBranch.telepon}
                            onChange={(e) =>
                              setNewBranch({
                                ...newBranch,
                                telepon: e.target.value,
                              })
                            }
                            placeholder="Masukkan nomor telepon"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Alamat
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={newBranch.alamat}
                          onChange={(e) =>
                            setNewBranch({
                              ...newBranch,
                              alamat: e.target.value,
                            })
                          }
                          placeholder="Masukkan alamat lengkap"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          onClick={handleAddBranch}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  )}

                {/* Branch List */}
                <div className="space-y-3">
                  {pharmacy.branches.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 text-sm bg-gray-50 rounded-lg">
                      Belum ada cabang. Silakan tambahkan cabang baru.
                    </div>
                  ) : (
                    pharmacy.branches.map((branch) => (
                      <div
                        key={branch.id_cabang}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        {editingBranch &&
                        editingBranch.id_cabang === branch.id_cabang ? (
                          // Editing branch mode
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-700">
                                Edit Cabang
                              </h5>
                              <div className="flex gap-2">
                                <button
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  onClick={() => setEditingBranch(null)}
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  className="p-1 text-green-500 hover:text-green-600"
                                  onClick={saveEditedBranch}
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nama Cabang
                                </label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  value={editingBranch.nama_cabang}
                                  onChange={(e) =>
                                    setEditingBranch({
                                      ...editingBranch,
                                      nama_cabang: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  No. Telepon
                                </label>
                                <input
                                  type="text"
                                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  value={editingBranch.telepon}
                                  onChange={(e) =>
                                    setEditingBranch({
                                      ...editingBranch,
                                      telepon: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Alamat
                              </label>
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={editingBranch.alamat}
                                onChange={(e) =>
                                  setEditingBranch({
                                    ...editingBranch,
                                    alamat: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          // Normal branch view
                          <>
                            <div className="flex justify-between">
                              <h5 className="font-medium text-gray-800">
                                {branch.nama_cabang}
                              </h5>
                              <div className="flex gap-2">
                                <button
                                  className="p-1 text-gray-400 hover:text-blue-500"
                                  onClick={() => startEditingBranch(branch)}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  onClick={() =>
                                    handleDeleteBranch(pharmacy.id, branch.id)
                                  }
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-start gap-2">
                                <MapPin
                                  size={14}
                                  className="text-gray-400 mt-0.5 flex-shrink-0"
                                />
                                <p className="text-sm text-gray-600">
                                  {branch.alamat}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone
                                  size={14}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <p className="text-sm text-gray-600">
                                  {branch.telepon}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {pharmacies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
            <Store size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 mb-6">
              Belum ada apotek yang terdaftar
            </p>
            <button
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setIsAddingPharmacy(true)}
            >
              <PlusCircle size={18} />
              <span>Tambah Apotek</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainStore;
