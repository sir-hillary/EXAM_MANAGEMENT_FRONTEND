import { useState, useRef } from "react";
import { Upload, Trash2, Eye, EyeOff, Loader2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  useAllBanners,
  useUploadBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "../../hooks/useBanners";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/spinner";

const BannerManagement = () => {
  const { data: banners = [], isLoading } = useAllBanners();
  const uploadBanner = useUploadBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form state for new upload
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newOrder, setNewOrder] = useState("0");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Select an image first");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("title", newTitle);
      formData.append("caption", newCaption);
      formData.append("display_order", newOrder);

      await uploadBanner.mutateAsync(formData);
      toast.success("Banner uploaded");
      setSelectedFile(null);
      setPreviewUrl(null);
      setNewTitle("");
      setNewCaption("");
      setNewOrder("0");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (banner) => {
    try {
      await updateBanner.mutateAsync({
        id: banner.id,
        payload: { is_active: !banner.is_active },
      });
      toast.success(banner.is_active ? "Banner hidden" : "Banner shown");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Login Page Banners"
        description="Manage the slideshow images shown on the login screen"
      />

      {/* ── Upload form ────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Upload new banner
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Drop zone */}
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              style={{ minHeight: "160px", background: "#fafbfc" }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                  style={{ maxHeight: "200px" }}
                />
              ) : (
                <>
                  <ImageIcon size={28} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 text-center px-4">
                    Click to select an image
                    <br />
                    <span className="text-gray-300">
                      JPEG, PNG, WebP · max 10 MB
                    </span>
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Title (optional)
              </label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Excellence in Education"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Caption (optional)
              </label>
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="A short message shown below the title..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Display order
              </label>
              <input
                type="number"
                min="0"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Lower numbers appear first in the slideshow
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="btn-primary justify-center sm:w-auto"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload size={14} /> Upload banner
            </>
          )}
        </button>
      </div>

      {/* ── Existing banners ───────────────────────────────────────────── */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Current banners {banners.length > 0 && `(${banners.length})`}
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-12 text-center">
          <ImageIcon size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No banners uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                banner.is_active
                  ? "border-gray-200"
                  : "border-gray-100 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative" style={{ paddingTop: "60%" }}>
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full border">
                      Hidden
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {banner.title || (
                    <span className="text-gray-400 font-normal">Untitled</span>
                  )}
                </p>
                {banner.caption && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {banner.caption}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Order: {banner.display_order}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                      banner.is_active
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {banner.is_active ? (
                      <Eye size={12} />
                    ) : (
                      <EyeOff size={12} />
                    )}
                    {banner.is_active ? "Visible" : "Hidden"}
                  </button>

                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-auto"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteBanner.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Banner deleted");
              setDeleteTarget(null);
            },
            onError: () => {
              toast.error("Delete failed");
            },
          })
        }
        title="Delete banner"
        message={`Delete "${deleteTarget?.title || "this banner"}"? This will also remove it from Cloudinary and it cannot be recovered.`}
        isLoading={deleteBanner.isPending}
      />
    </div>
  );
};

export default BannerManagement;
