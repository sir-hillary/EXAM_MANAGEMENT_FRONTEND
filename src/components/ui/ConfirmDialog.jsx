import Modal from "./Modal";


const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
    <p className="text-sm text-gray-600 mb-4">{message}</p>
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
      <button
        onClick={onClose}
        className="btn-secondary w-full sm:w-auto justify-center"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="btn-danger w-full sm:w-auto justify-center"
      >
        {isLoading ? "Deleting..." : "Delete"}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
