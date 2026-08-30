import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  ChevronDown,
  WalletCards,
  Users,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  useExamFees,
  useRecordFee,
  useBulkSetFees,
} from "../../hooks/useExamFees";
import { StudentAvatar } from "../../components/ui/StudentAvatar";
import Modal from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/spinner";

const statusConfig = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    color: "text-green-700",
    bg: "bg-green-50 text-green-700",
    border: "border-green-200",
  },
  partial: {
    label: "Partial",
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
  },
  unpaid: {
    label: "Unpaid",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 text-red-700",
    border: "border-red-200",
  },
  waived: {
    label: "Waived",
    icon: CheckCircle2,
    color: "text-blue-600",
    bg: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Payment Modal
───────────────────────────────────────────────────────────────────────────── */

const PaymentModal = ({ isOpen, onClose, student, examId }) => {
  const recordFee = useRecordFee();

  const [form, setForm] = useState({
    amount_due: student?.amount_due || "",
    amount_paid: student?.amount_paid || "",
    payment_status: student?.payment_status || "unpaid",
    payment_ref: student?.payment_ref || "",
    payment_date: student?.payment_date?.split("T")[0] || "",
    notes: "",
  });

  const handleSave = async () => {
    try {
      await recordFee.mutateAsync({
        student_id: student.student_id,
        exam_id: examId,
        amount_due: Number(form.amount_due),
        amount_paid: Number(form.amount_paid),
        payment_status: form.payment_status,
        payment_ref: form.payment_ref || null,
        payment_date: form.payment_date || null,
        notes: form.notes || null,
      });

      toast.success("Payment updated");
      onClose();
    } catch (error) {
      toast.error("Failed to update payment");
      console.error(error);
    }
  };

  if (!student) return null;

  const status = statusConfig[form.payment_status] || statusConfig.unpaid;
  const StatusIcon = status.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record payment"
      maxWidth="max-w-md"
    >
      {/* Student identity */}
      <div
        className="flex items-center gap-3.5 mb-5 p-3.5 rounded-xl"
        style={{
          background: "#f4f8f5",
          border: "1px solid rgba(26,58,42,0.08)",
        }}
      >
        <StudentAvatar student={student} size="md" />

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {student.first_name} {student.last_name}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-gray-500">
              {student.student_number}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg}`}
            >
              <StatusIcon size={10} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Amount due
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">
                KES
              </span>

              <input
                type="number"
                className="input-field pl-11"
                value={form.amount_due}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount_due: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Amount paid
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">
                KES
              </span>

              <input
                type="number"
                className="input-field pl-11"
                value={form.amount_paid}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount_paid: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Payment status
          </label>

          <select
            className="input-field"
            value={form.payment_status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                payment_status: e.target.value,
              }))
            }
          >
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            M-Pesa / Receipt reference
          </label>

          <input
            className="input-field"
            placeholder="e.g. QHJ8K9MN23"
            value={form.payment_ref}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                payment_ref: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Payment date
          </label>

          <input
            type="date"
            className="input-field"
            value={form.payment_date}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                payment_date: e.target.value,
              }))
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full sm:w-auto justify-center"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={recordFee.isPending}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          {recordFee.isPending ? "Saving…" : "Save payment"}
        </button>
      </div>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Summary Card
───────────────────────────────────────────────────────────────────────────── */

const SummaryCard = ({ label, value, icon: Icon, accent }) => {
  return (
    <div
      className="bg-white rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid rgba(26,58,42,0.09)",
        boxShadow: "0 1px 2px rgba(26,58,42,0.03)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
        </div>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: "#f3f7f4",
            color: "#1a3a2a",
          }}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Exam Fee Manager
───────────────────────────────────────────────────────────────────────────── */

const ExamFeeManager = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useExamFees(examId);
  const bulkSetFees = useBulkSetFees();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bulkAmount, setBulkAmount] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const handleBulkSet = async () => {
    if (!bulkAmount) {
      toast.error("Enter an amount");
      return;
    }

    try {
      await bulkSetFees.mutateAsync({
        examId: Number(examId),
        amountDue: Number(bulkAmount),
      });

      toast.success("Exam fee set for all students");
      setShowBulk(false);
      setBulkAmount("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to set exam fees");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={17} />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load exam fees
            </p>

            <p className="text-xs text-red-600 mt-0.5">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { exam, fees, summary } = data;

  return (
    <div className="space-y-6">
      {/* ── Page heading ─────────────────────────────────────────────────── */}

      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#1a3a2a] transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Back to exams
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: "#1a3a2a",
                  background: "rgba(201,168,76,0.14)",
                }}
              >
                <ReceiptText size={11} />
                Exam fees
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {exam.title}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage student eligibility, payments and outstanding balances.
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Eligible students"
          value={summary.eligible}
          icon={Users}
          accent="text-[#1a3a2a]"
        />

        <SummaryCard
          label="Paid"
          value={summary.paid}
          icon={CheckCircle2}
          accent="text-green-600"
        />

        <SummaryCard
          label="Partial"
          value={summary.partial}
          icon={Clock}
          accent="text-amber-600"
        />

        <SummaryCard
          label="Unpaid"
          value={summary.unpaid}
          icon={CircleDollarSign}
          accent="text-red-600"
        />
      </div>

      {/* ── Bulk fee management ──────────────────────────────────────────── */}

      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(26,58,42,0.09)",
          boxShadow: "0 1px 2px rgba(26,58,42,0.03)",
        }}
      >
        <button
          onClick={() => setShowBulk((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(201,168,76,0.13)",
                color: "#1a3a2a",
              }}
            >
              <WalletCards size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Set exam fee for entire class
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Apply the same amount due to all eligible students.
              </p>
            </div>
          </div>

          <ChevronDown
            size={17}
            className={`text-gray-400 transition-transform ${
              showBulk ? "rotate-180" : ""
            }`}
          />
        </button>

        {showBulk && (
          <div className="px-4 pb-4">
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                  KES
                </span>

                <input
                  type="number"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  placeholder="Enter amount e.g. 500"
                  className="input-field pl-11"
                />
              </div>

              <button
                onClick={handleBulkSet}
                disabled={bulkSetFees.isPending}
                className="btn-primary shrink-0 justify-center"
              >
                {bulkSetFees.isPending ? "Setting…" : "Set for all"}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mt-2">
              This will update the amount due for students associated with this
              exam.
            </p>
          </div>
        )}
      </div>

      {/* ── Student fees ─────────────────────────────────────────────────── */}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Student payments
            </h2>

            <p className="text-xs text-gray-500 mt-0.5">
              {fees.length} student{fees.length !== 1 ? "s" : ""} registered for
              this exam
            </p>
          </div>
        </div>

        {/* Desktop table */}
        <div
          className="hidden md:block bg-white rounded-xl overflow-hidden"
          style={{
            border: "1px solid rgba(26,58,42,0.09)",
            boxShadow: "0 1px 2px rgba(26,58,42,0.03)",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: "rgba(26,58,42,0.07)",
                  background: "#f7faf8",
                }}
              >
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Student
                </th>

                <th className="text-right px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Due
                </th>

                <th className="text-right px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Paid
                </th>

                <th className="text-right px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Balance
                </th>

                <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {fees.map((fee) => {
                const sc =
                  statusConfig[fee.payment_status] || statusConfig.unpaid;

                const StatusIcon = sc.icon;

                return (
                  <tr
                    key={fee.student_id}
                    className="hover:bg-[#f8faf9] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={fee} size="sm" />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {fee.first_name} {fee.last_name}
                            </p>

                            {fee.is_eligible ? (
                              <CheckCircle2
                                size={13}
                                className="text-green-500 shrink-0"
                              />
                            ) : (
                              <AlertCircle
                                size={13}
                                className="text-red-400 shrink-0"
                              />
                            )}
                          </div>

                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {fee.student_number}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-gray-700">
                        {Number(fee.amount_due) > 0
                          ? `KES ${Number(fee.amount_due).toLocaleString()}`
                          : "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-green-700">
                        {Number(fee.amount_paid) > 0
                          ? `KES ${Number(fee.amount_paid).toLocaleString()}`
                          : "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {Number(fee.balance) > 0 ? (
                        <span className="font-bold text-red-600">
                          KES {Number(fee.balance).toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg}`}
                      >
                        <StatusIcon size={11} />
                        {sc.label}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudent(fee)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          color: "#1a3a2a",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,168,76,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {fees.map((fee) => {
            const sc = statusConfig[fee.payment_status] || statusConfig.unpaid;

            const StatusIcon = sc.icon;

            return (
              <div
                key={fee.student_id}
                className={`bg-white rounded-xl p-4 ${
                  fee.is_eligible
                    ? "border border-gray-200"
                    : "border border-red-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <StudentAvatar student={fee} size="sm" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {fee.first_name} {fee.last_name}
                        </p>

                        {fee.is_eligible ? (
                          <CheckCircle2
                            size={12}
                            className="text-green-500 shrink-0"
                          />
                        ) : (
                          <AlertCircle
                            size={12}
                            className="text-red-400 shrink-0"
                          />
                        )}
                      </div>

                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {fee.student_number}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${sc.bg}`}
                  >
                    <StatusIcon size={10} />
                    {sc.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                      Due
                    </p>

                    <p className="text-xs font-bold text-gray-800 mt-1">
                      KES {Number(fee.amount_due).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50/70 p-2.5">
                    <p className="text-[10px] text-green-600 uppercase tracking-wide font-semibold">
                      Paid
                    </p>

                    <p className="text-xs font-bold text-green-700 mt-1">
                      KES {Number(fee.amount_paid).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg p-2.5 ${
                      Number(fee.balance) > 0
                        ? "bg-red-50/70"
                        : "bg-green-50/70"
                    }`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-wide font-semibold ${
                        Number(fee.balance) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Balance
                    </p>

                    <p
                      className={`text-xs font-bold mt-1 ${
                        Number(fee.balance) > 0
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      {Number(fee.balance) > 0
                        ? `KES ${Number(fee.balance).toLocaleString()}`
                        : "Cleared"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(fee)}
                  className="w-full mt-3 text-xs font-semibold py-2 rounded-lg transition-colors"
                  style={{
                    color: "#1a3a2a",
                    background: "#f3f7f4",
                    border: "1px solid rgba(26,58,42,0.08)",
                  }}
                >
                  Update payment
                </button>
              </div>
            );
          })}
        </div>

        {fees.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl py-14 text-center">
            <div
              className="w-11 h-11 rounded-xl mx-auto flex items-center justify-center mb-3"
              style={{
                background: "#f3f7f4",
                color: "#1a3a2a",
              }}
            >
              <Users size={20} />
            </div>

            <p className="text-sm font-semibold text-gray-700">
              No students found
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Students registered for this exam will appear here.
            </p>
          </div>
        )}
      </div>

      {/* ── Payment modal ────────────────────────────────────────────────── */}

      <PaymentModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
        examId={Number(examId)}
      />
    </div>
  );
};

export default ExamFeeManager;
