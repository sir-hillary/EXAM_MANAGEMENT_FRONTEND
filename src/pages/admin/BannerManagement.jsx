import { useState, useRef } from "react";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  Sparkles,
  ArrowUp,
  CheckCircle2,
} from "lucide-react";
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

  // ── Form state ─────────────────────────────────────────────────────────────
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newOrder, setNewOrder] = useState("0");

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
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

      toast.success("Banner uploaded successfully");

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setNewTitle("");
      setNewCaption("");
      setNewOrder("0");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Toggle visibility ─────────────────────────────────────────────────────
  const toggleActive = async (banner) => {
    try {
      await updateBanner.mutateAsync({
        id: banner.id,
        payload: {
          is_active: !banner.is_active,
        },
      });

      toast.success(banner.is_active ? "Banner hidden" : "Banner shown");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-7">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Login Page Banners"
        description="Manage the slideshow images displayed on the login screen."
      />

      {/* ── Upload Section ────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8e0",
          boxShadow: "0 8px 30px rgba(26,58,42,0.06)",
        }}
      >
        {/* Section heading */}
        <div
          className="px-5 sm:px-6 py-4 flex items-center gap-3"
          style={{
            borderBottom: "1px solid #edf1ed",
            background:
              "linear-gradient(135deg, rgba(201,168,76,0.06), rgba(26,58,42,0.02))",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(201,168,76,0.14)",
              color: "#a88932",
            }}
          >
            <Sparkles size={17} />
          </div>

          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1a3a2a" }}>
              Add a new banner
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              Upload an image and optionally add a title and caption.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
            {/* ── Image upload area ─────────────────────────────────────── */}
            <div>
              <label
                className="block text-xs font-bold mb-2"
                style={{ color: "#1a3a2a" }}
              >
                Banner image
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                style={{
                  minHeight: "235px",
                  borderColor: previewUrl ? "#c9a84c" : "#dce5de",
                  background: previewUrl ? "#f7f9f7" : "#fafcfb",
                }}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Banner preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Preview overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                        <Upload size={15} style={{ color: "#1a3a2a" }} />
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#1a3a2a" }}
                        >
                          Change image
                        </span>
                      </div>
                    </div>

                    {/* Selected badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm">
                        <CheckCircle2 size={12} style={{ color: "#2d7a4b" }} />
                        Image selected
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{
                        background: "rgba(201,168,76,0.11)",
                        color: "#b3953c",
                      }}
                    >
                      <ImageIcon size={22} />
                    </div>

                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#1a3a2a" }}
                    >
                      Select a banner image
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Click anywhere in this area to browse your device
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      {["JPEG", "PNG", "WebP"].map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold"
                          style={{
                            background: "#edf3ee",
                            color: "#668070",
                          }}
                        >
                          {type}
                        </span>
                      ))}

                      <span className="text-[10px] text-gray-400">
                        Max 10 MB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              {selectedFile && (
                <div className="flex items-center justify-between mt-2 px-1">
                  <p className="text-[11px] text-gray-400 truncate max-w-[70%]">
                    {selectedFile.name}
                  </p>

                  <p className="text-[11px] text-gray-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* ── Metadata form ─────────────────────────────────────────── */}
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: "#1a3a2a" }}
                >
                  Title
                  <span className="font-normal text-gray-400 ml-1">
                    (optional)
                  </span>
                </label>

                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Excellence in Education"
                  maxLength={200}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: "#f8faf8",
                    border: "1px solid #dfe7e1",
                    color: "#1a3a2a",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: "#1a3a2a" }}
                >
                  Caption
                  <span className="font-normal text-gray-400 ml-1">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="A short message shown below the title..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none transition-all"
                  style={{
                    background: "#f8faf8",
                    border: "1px solid #dfe7e1",
                    color: "#1a3a2a",
                  }}
                />

                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-gray-400">
                    {newCaption.length}/500
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: "#1a3a2a" }}
                >
                  Display order
                </label>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={newOrder}
                    onChange={(e) => setNewOrder(e.target.value)}
                    className="w-28 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{
                      background: "#f8faf8",
                      border: "1px solid #dfe7e1",
                      color: "#1a3a2a",
                    }}
                  />

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Lower numbers appear first in the slideshow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload action */}
          <div
            className="mt-6 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ borderTop: "1px solid #edf1ed" }}
          >
            <p className="text-xs text-gray-400">
              The banner will be uploaded securely and made available to the
              login page.
            </p>

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #1a3a2a, #2d5a3e)",
                boxShadow: "0 4px 14px rgba(26,58,42,0.18)",
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload banner
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Existing banners heading ─────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold" style={{ color: "#1a3a2a" }}>
              Current banners
            </h2>

            {banners.length > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-[10px] font-bold"
                style={{
                  background: "rgba(201,168,76,0.14)",
                  color: "#9d8230",
                }}
              >
                {banners.length}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Control which images appear on the public login screen.
          </p>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div
          className="bg-white rounded-2xl border flex justify-center py-16"
          style={{ borderColor: "#e2e8e0" }}
        >
          <Spinner size="lg" />
        </div>
      ) : banners.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div
          className="rounded-2xl py-16 px-5 text-center"
          style={{
            background: "#ffffff",
            border: "1px dashed #d5dfd7",
          }}
        >
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "#edf3ee",
              color: "#78917f",
            }}
          >
            <ImageIcon size={25} />
          </div>

          <h3 className="text-sm font-bold" style={{ color: "#1a3a2a" }}>
            No banners yet
          </h3>

          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Upload your first login banner above to create the slideshow
            visitors will see.
          </p>
        </div>
      ) : (
        /* ── Banner cards ────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="group bg-white rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                border: `1px solid ${banner.is_active ? "#e0e8e2" : "#edf0ed"}`,
                boxShadow: banner.is_active
                  ? "0 6px 24px rgba(26,58,42,0.06)"
                  : "none",
                opacity: banner.is_active ? 1 : 0.7,
              }}
            >
              {/* ── Image ──────────────────────────────────────────────── */}
              <div
                className="relative overflow-hidden"
                style={{
                  height: "190px",
                  background: "#eef2ef",
                }}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                />

                {/* Image gradient */}
                <div
                  className="absolute inset-x-0 bottom-0 h-20"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,35,24,0.48), transparent)",
                  }}
                />

                {/* Order badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm"
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      color: "#1a3a2a",
                    }}
                  >
                    <ArrowUp size={10} />#{index + 1}
                  </span>
                </div>

                {/* Status */}
                <div className="absolute top-3 right-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm"
                    style={{
                      background: banner.is_active
                        ? "rgba(236,253,243,0.94)"
                        : "rgba(255,255,255,0.92)",
                      color: banner.is_active ? "#187044" : "#64736a",
                    }}
                  >
                    {banner.is_active ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff size={10} />
                        Hidden
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* ── Details ────────────────────────────────────────────── */}
              <div className="p-4">
                <div className="min-h-[66px]">
                  <h3
                    className="text-sm font-bold truncate"
                    style={{
                      color: banner.title ? "#1a3a2a" : "#9aa79e",
                    }}
                  >
                    {banner.title || "Untitled banner"}
                  </h3>

                  {banner.caption ? (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {banner.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300 mt-1 italic">
                      No caption provided
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div
                  className="flex items-center justify-between mt-3 pt-3"
                  style={{ borderTop: "1px solid #edf1ed" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "#7b8d82" }}
                    >
                      Display order
                    </span>

                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: "#f1f5f2",
                        color: "#1a3a2a",
                      }}
                    >
                      {banner.display_order}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleActive(banner)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition-colors"
                    style={{
                      background: banner.is_active ? "#edf8f0" : "#f3f5f3",
                      color: banner.is_active ? "#187044" : "#64736a",
                    }}
                  >
                    {banner.is_active ? (
                      <Eye size={13} />
                    ) : (
                      <EyeOff size={13} />
                    )}

                    {banner.is_active ? "Visible" : "Hidden"}
                  </button>

                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition-colors"
                    style={{
                      background: "#fff1f1",
                      color: "#c24141",
                    }}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
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
        message={`Delete "${
          deleteTarget?.title || "this banner"
        }"? This will also remove it from Cloudinary and it cannot be recovered.`}
        isLoading={deleteBanner.isPending}
      />
    </div>
  );
};

export default BannerManagement;
