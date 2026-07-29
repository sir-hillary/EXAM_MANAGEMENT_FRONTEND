import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import Modal from "./Modal";

const schema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((d) => d.current_password !== d.new_password, {
    message: "New password must differ from current",
    path: ["new_password"],
  });

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success("Password updated successfully");
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    }
  };

  const PasswordInput = ({
    field,
    show,
    onToggle,
    placeholder,
    label,
    error,
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="input-field pr-9"
          {...field}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change password"
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <PasswordInput
          field={register("current_password")}
          show={showCurrent}
          onToggle={() => setShowCurrent((s) => !s)}
          label="Current password"
          placeholder="Enter current password"
          error={errors.current_password}
        />
        <PasswordInput
          field={register("new_password")}
          show={showNew}
          onToggle={() => setShowNew((s) => !s)}
          label="New password"
          placeholder="Min 8 chars, uppercase, number"
          error={errors.new_password}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="Repeat new password"
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        {/* Strength hint */}
        <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
          Password must be 8+ characters with at least one uppercase letter,
          lowercase letter, and number.
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
