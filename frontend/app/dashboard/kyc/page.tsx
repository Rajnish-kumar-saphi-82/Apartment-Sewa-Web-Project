"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck, Upload, FileText, CheckCircle2, XCircle,
  Clock, Trash2, ChevronDown, Eye, AlertCircle, Camera, UserCircle2, CheckCheck
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useAlert } from "@/lib/context/AlertContext";
import { deleteKyc, getAllKyc, getMyKyc, reviewKyc, submitKyc } from "@/lib/api/kyc-emergency";

// Only meaningful KYC document types — no "Password"
const DOC_TYPES = ["Citizenship", "Passport", "Driver License"] as const;
type DocType = typeof DOC_TYPES[number];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Pending: { bg: "#fef3c7", text: "#92400e", icon: <Clock size={14} /> },
  Approved: { bg: "#d1fae5", text: "#065f46", icon: <CheckCircle2 size={14} /> },
  Rejected: { bg: "#fee2e2", text: "#991b1b", icon: <XCircle size={14} /> },
};

export default function KycPage() {
  const { user, refreshUser } = useAuth();
  const { showAlert, showConfirm } = useAlert();

  const [docType, setDocType] = useState<DocType>("Citizenship");
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [ownershipCert, setOwnershipCert] = useState<File | null>(null);

  const docFrontRef = useRef<HTMLInputElement>(null);
  const docBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewModal, setReviewModal] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [viewModal, setViewModal] = useState<any | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isAdmin = user?.role === "Admin";
  const isOwner = user?.role === "Owner";
  const isAdminOrOwner = isAdmin || isOwner;
  const isOwnerSubmitter = isOwner;

  // Check if the user already has an approved KYC
  const hasApprovedKyc = user?.kyc_status === "approved";
  const hasPendingKyc = user?.kyc_status === "pending";

  // Check if user has a profile image (required for KYC)
  const hasProfileImage = !!(user?.profile_image && user.profile_image.trim() !== "");

  const load = async () => {
    setLoading(true);
    try {
      const res = isAdminOrOwner ? await getAllKyc() : await getMyKyc();
      setRecords((res.data as any).data || []);
    } catch (e: any) {
      console.error("Failed to load KYC records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role) load();
  }, [user?.role]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    const f = e.target.files?.[0];
    if (f) setter(f);
  };

  const getPreview = (file: File | null) => {
    if (!file) return null;
    return file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Profile image check
    if (!hasProfileImage) {
      showAlert("Please add a profile photo in your Settings before submitting KYC. This is required to verify your identity.", "Profile Photo Required");
      return;
    }

    if (!documentFront) {
      showAlert(`Please upload your ${docType === "Citizenship" ? "Document Front" : "Document"}.`, "Missing File");
      return;
    }

    if (docType === "Citizenship" && !documentBack) {
      showAlert("Document Back is required for Citizenship.", "Missing File");
      return;
    }

    if (!selfie) {
      showAlert("Please upload a selfie photo for identity verification.", "Missing Selfie");
      return;
    }

    if (isOwnerSubmitter && !ownershipCert) {
      showAlert("Land Ownership Certificate is required for Owners.", "Missing Certificate");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("documentType", docType);
      fd.append("documentFront", documentFront);
      if (documentBack) fd.append("documentBack", documentBack);
      fd.append("selfie", selfie);
      if (ownershipCert) fd.append("ownershipCert", ownershipCert);

      await submitKyc(fd);

      // Reset form
      setDocumentFront(null);
      setDocumentBack(null);
      setSelfie(null);
      setOwnershipCert(null);

      await load();
      // Refresh user so kyc_status updates to "pending" immediately
      await refreshUser();
      showAlert("Your KYC is under review! Our team will verify it shortly.", "Submitted Successfully");
    } catch (e: any) {
      showAlert(e.response?.data?.message || "Failed to submit. Please try again.", "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (status: "Approved" | "Rejected") => {
    if (!reviewModal) return;
    try {
      await reviewKyc(reviewModal._id || reviewModal.id, status, reviewNote);
      setReviewModal(null);
      setReviewNote("");
      await load();
      // Refresh reviewer's own status too
      await refreshUser();
    } catch {
      showAlert("Failed to update review status.", "Error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await showConfirm("Delete this KYC record?"))) return;
    try {
      await deleteKyc(id);
      await load();
    } catch {
      showAlert("Failed to delete record.", "Error");
    }
  };

  const renderUploadBox = (
    title: string,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    icon: React.ReactNode,
    required = false
  ) => {
    const preview = getPreview(file);
    return (
      <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>
          {title} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </span>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${file ? "#10b981" : "#cbd5e1"}`,
            borderRadius: "12px",
            padding: file ? "8px" : "24px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: file ? "#f0fdf4" : "#f8fafc",
            transition: "all 0.2s",
            height: "140px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          {preview ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }} />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setter(null); if (inputRef.current) inputRef.current.value = ""; }}
                style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <XCircle size={14} />
              </button>
            </div>
          ) : file ? (
            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <FileText size={32} color="#10b981" />
              <span style={{ fontSize: "12px", fontWeight: 600, marginTop: "8px", wordBreak: "break-all" }}>{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setter(null); if (inputRef.current) inputRef.current.value = ""; }}
                style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <XCircle size={14} />
              </button>
            </div>
          ) : (
            <>
              {icon}
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginTop: "8px" }}>Click to upload</div>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => handleFileChange(e, setter)} />
      </div>
    );
  };

  return (
    <div style={{ padding: "0" }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Identity Verification (KYC)</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Review and approve identity documents"
              : isOwner
                ? "Submit your KYC and review tenant documents"
                : "Complete your KYC to unlock all platform features"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr" : "1fr 1fr", gap: "24px", alignItems: "start" }}>

        {/* ── Submit Form (Tenant / Owner) ─────────────────────────────────── */}
        {!isAdmin && (
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #1a56db, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={22} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary, #0f172a)" }}>
                  {hasApprovedKyc ? "KYC Verified ✓" : "Complete Your KYC"}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  {hasApprovedKyc
                    ? "Your identity has been verified. All features are unlocked."
                    : "Required to unlock all platform features."}
                </div>
              </div>
            </div>

            {/* ── Already Approved Banner ── */}
            {hasApprovedKyc ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "32px", background: "#f0fdf4", borderRadius: "16px", border: "2px solid #86efac", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCheck size={32} color="#16a34a" />
                </div>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "#15803d" }}>Identity Verified</div>
                <div style={{ fontSize: "14px", color: "#166534", maxWidth: "280px" }}>
                  Your KYC has been approved. You have full access to all features on the platform.
                </div>
              </div>
            ) : hasPendingKyc ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "32px", background: "#fefce8", borderRadius: "16px", border: "2px solid #fde047", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={32} color="#ca8a04" />
                </div>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "#a16207" }}>Under Review</div>
                <div style={{ fontSize: "14px", color: "#713f12", maxWidth: "280px" }}>
                  Your documents have been submitted and are being reviewed. You will be notified once verified.
                </div>
              </div>
            ) : (
              <>
                {/* ── Profile Image Warning ── */}
                {!hasProfileImage && (
                  <div style={{ display: "flex", gap: "12px", padding: "14px", background: "#fff7ed", borderRadius: "10px", border: "1px solid #fed7aa", marginBottom: "20px", alignItems: "flex-start" }}>
                    <UserCircle2 size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#9a3412" }}>Profile Photo Required</div>
                      <div style={{ fontSize: "12px", color: "#c2410c", marginTop: "2px" }}>
                        Please add a profile photo in <a href="/profile" style={{ color: "#ea580c", fontWeight: 600 }}>Settings → Profile</a> before submitting KYC.
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Step 1: Document Type */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Step 1: Select Document Type</label>
                    <div className="form-select-wrapper">
                      <select
                        className="form-select"
                        value={docType}
                        onChange={e => setDocType(e.target.value as DocType)}
                      >
                        {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Step 2: Document Front & Back */}
                  <div>
                    <label className="form-label">
                      Step 2: Upload Document {docType === "Citizenship" ? "(Front & Back)" : ""}
                    </label>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      {renderUploadBox(docType === "Citizenship" ? `${docType} — Front` : `${docType} Upload`, documentFront, docFrontRef, setDocumentFront, <Upload size={24} color="#94a3b8" />, true)}
                      {docType === "Citizenship" && renderUploadBox(`${docType} — Back`, documentBack, docBackRef, setDocumentBack, <Upload size={24} color="#94a3b8" />, true)}
                    </div>
                  </div>

                  {/* Step 3: Selfie */}
                  <div>
                    <label className="form-label">Step 3: Identity Selfie</label>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      {renderUploadBox("Upload Your Selfie", selfie, selfieRef, setSelfie, <Camera size={24} color="#94a3b8" />, true)}
                      {isOwnerSubmitter && renderUploadBox("Land Ownership Certificate", ownershipCert, certRef, setOwnershipCert, <FileText size={24} color="#94a3b8" />, true)}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || !documentFront || (docType === "Citizenship" && !documentBack) || !selfie || (isOwnerSubmitter && !ownershipCert) || !hasProfileImage}
                    style={{ opacity: (submitting || !hasProfileImage) ? 0.6 : 1, padding: "14px", fontSize: "15px", marginTop: "12px" }}
                  >
                    {submitting ? "Submitting securely…" : "Submit KYC Documents"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* ── Records List ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary, #0f172a)" }}>
            {user?.role === "Tenant" ? "My Submissions" : "KYC Submissions"}
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading…</div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", color: "#64748b" }}>
              <AlertCircle size={36} style={{ margin: "0 auto 12px", color: "#cbd5e1" }} />
              <div style={{ fontWeight: 600 }}>No KYC submissions yet</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                {isAdminOrOwner ? "No pending documents to review." : "Upload your documents to get verified."}
              </div>
            </div>
          ) : (
            <>
              {records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((r: any) => {
                const s = STATUS_STYLES[r.status] || STATUS_STYLES.Pending;
                return (
                  <div key={r._id || r.id} className="interactive-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShieldCheck size={22} color="#1a56db" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary, #0f172a)", fontSize: "14px" }}>{r.documentType}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Submitted: {new Date(r.submittedAt || r.created_at).toLocaleDateString()}
                      </div>
                      {isAdminOrOwner && (
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>User ID: {r.userId}</div>
                      )}
                      {r.reviewNote && (
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontStyle: "italic" }}>Note: {r.reviewNote}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "20px", background: s.bg, color: s.text, fontSize: "12px", fontWeight: 600 }}>
                        {s.icon} {r.status}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => setViewModal(r)}
                          style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="View Documents">
                          <Eye size={14} color="#1a56db" />
                        </button>
                        {isAdminOrOwner && r.status === "Pending" && (
                          <button onClick={() => { setReviewModal(r); setReviewNote(""); }}
                            style={{ padding: "4px 10px", borderRadius: "8px", border: "none", background: "#1a56db", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                            Review
                          </button>
                        )}
                        {isAdminOrOwner && (
                          <button onClick={() => handleDelete(r._id || r.id)}
                            style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Pagination */}
              {records.length > ITEMS_PER_PAGE && (
                <div className="pagination-wrapper" style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", marginTop: "16px", borderRadius: "12px", background: "#fff" }}>
                  <span className="pagination-text">
                    Page {currentPage} of {Math.ceil(records.length / ITEMS_PER_PAGE)}
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(records.length / ITEMS_PER_PAGE) }).map((_, i) => (
                      <button
                        key={i}
                        className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pagination-btn"
                      disabled={currentPage >= Math.ceil(records.length / ITEMS_PER_PAGE)}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── View Document Modal ─────────────────────────────────────────── */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)} style={{ padding: "40px" }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "900px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header">
              <h3 className="modal-title">Document Verification — {viewModal.documentType}</h3>
              <button onClick={() => setViewModal(null)} className="modal-close-btn">✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Document Front */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>Document Front</h4>
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {viewModal.documentFrontUrl
                    ? <img src={viewModal.documentFrontUrl} alt="Front" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "contain" }} />
                    : <span style={{ color: "#94a3b8" }}>No image</span>}
                </div>
              </div>

              {/* Document Back */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>Document Back</h4>
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {viewModal.documentBackUrl
                    ? <img src={viewModal.documentBackUrl} alt="Back" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "contain" }} />
                    : <span style={{ color: "#94a3b8" }}>No image</span>}
                </div>
              </div>

              {/* Selfie */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>Selfie (Face Match)</h4>
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {viewModal.selfieUrl
                    ? <img src={viewModal.selfieUrl} alt="Selfie" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "contain" }} />
                    : <span style={{ color: "#94a3b8" }}>No image</span>}
                </div>
              </div>

              {/* Ownership Cert */}
              {viewModal.ownershipCertUrl && (
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>Land Ownership Certificate</h4>
                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={viewModal.ownershipCertUrl} alt="Cert" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "contain" }} />
                  </div>
                </div>
              )}
            </div>

            {isAdminOrOwner && viewModal.status === "Pending" && (
              <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button onClick={() => { setViewModal(null); setReviewModal(viewModal); }} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#1a56db", color: "white", fontWeight: 600, cursor: "pointer" }}>
                  Proceed to Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────────── */}
      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Review KYC — {reviewModal.documentType}</h3>
              <button onClick={() => setReviewModal(null)} className="modal-close-btn">✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px 0" }}>
              <div className="form-group">
                <label className="form-label">Review Note (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Document is blurry, please resubmit"
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button onClick={() => handleReview("Rejected")}
                  style={{ padding: "12px", borderRadius: "10px", border: "2px solid #ef4444", background: "white", color: "#ef4444", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <XCircle size={16} /> Reject
                </button>
                <button onClick={() => handleReview("Approved")}
                  style={{ padding: "12px", borderRadius: "10px", border: "none", background: "#10b981", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
