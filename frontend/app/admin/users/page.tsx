"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AdminUser,
  AdminUserPayload,
  AdminUserRole,
  AdminUsersMeta,
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "@/lib/api/admin-users";

const emptyForm: AdminUserPayload = {
  full_name: "",
  email: "",
  password: "",
  role: "Tenant",
  country_code: "+977",
  phone: "",
  is_verified: false,
};

const roles: AdminUserRole[] = ["Admin", "Owner", "Tenant"];
const countryCodes = ["+977", "+91", "+1", "+44", "+86"];
const pageLimit = 10;

const getErrorMessage = (exception: unknown, fallback: string) => {
  if (typeof exception === "object" && exception !== null) {
    const maybeError = exception as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return maybeError.response?.data?.message || maybeError.message || fallback;
  }

  return fallback;
};

const getUserName = (user: any) => {
  return user?.full_name || user?.fullName || user?.name || "Unknown User";
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminUsersMeta>({
    page: 1,
    limit: pageLimit,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminUserPayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = Boolean(editingUser);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: meta.totalPages }, (_, index) => index + 1);
  }, [meta.totalPages]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getAdminUsers({ page, limit: pageLimit, search });
      setUsers(result.data);
      setMeta(result.meta);
    } catch (exception: unknown) {
      setError(getErrorMessage(exception, "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
      country_code: user.country_code,
      phone: user.phone,
      is_verified: user.is_verified,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingUser(null);
    setFormErrors({});
  };

  const updateField = (
    field: keyof AdminUserPayload,
    value: string | boolean,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (formData.full_name.trim().length < 3) {
      nextErrors.full_name = "Full name must be at least 3 characters";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!/^\d{6,15}$/.test(formData.phone)) {
      nextErrors.phone = "Phone must contain 6 to 15 digits";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      if (editingUser) {
        await updateAdminUser(editingUser._id, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          country_code: formData.country_code,
          phone: formData.phone,
          is_verified: formData.is_verified,
        });
        setSuccess("User updated successfully");
      } else {
        await createAdminUser(formData);
        setSuccess("User created successfully");
      }

      setIsFormOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (exception: unknown) {
      setFormErrors({
        root: getErrorMessage(exception, "Unable to save user"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setIsDeleting(true);
      setError("");
      setSuccess("");
      await deleteAdminUser(deletingUser._id);
      setSuccess("User deleted successfully");
      setDeletingUser(null);

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchUsers();
      }
    } catch (exception: unknown) {
      setError(getErrorMessage(exception, "Unable to delete user"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Admin User Management</h1>
          <p className="page-subtitle">
            View, search, create, edit, and delete Apartment Sewa users.
          </p>
        </div>
        <div className="page-actions">
          <button className="admin-primary-btn" onClick={openCreateForm}>
            <Plus size={18} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="admin-alert admin-alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="table-card admin-users-card">
        <div className="admin-users-toolbar">
          <div>
            <h2 className="table-title">Users</h2>
            <p className="admin-muted-text">
              {meta.total} total account{meta.total === 1 ? "" : "s"}
            </p>
          </div>
          <form className="admin-search-form" onSubmit={handleSearchSubmit}>
            <Search size={18} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or email"
              className="admin-search-input"
            />
            <button type="submit" className="admin-search-btn">
              Search
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="admin-state-box">
            <Loader2 size={28} className="spin" />
            <span>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-state-box">
            <UsersEmptyIcon />
            <span>No users found</span>
            <p>Try a different search term or create a new user.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="admin-id-cell">{shortId(user._id)}</td>
                      <td>
                        <div className="entity-info">
                          <span className="entity-name">{getUserName(user)}</span>
                          <span className="entity-subtext">
                            {user.country_code} {user.phone}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="status-badge active">
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.is_verified ? "success" : "pending"
                          }`}
                        >
                          {user.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="admin-icon-btn"
                            onClick={() => openEditForm(user)}
                            aria-label={`Edit ${getUserName(user)}`}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="admin-icon-btn danger"
                            onClick={() => setDeletingUser(user)}
                            aria-label={`Delete ${getUserName(user)}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-wrapper">
              <span className="pagination-text">
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                {pageNumbers.slice(0, 7).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`pagination-btn ${
                      pageNumber === meta.page ? "active" : ""
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content admin-user-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? "Edit User" : "Create User"}
              </h2>
              <button className="modal-close-btn" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <form className="admin-user-form" onSubmit={handleSaveUser}>
              {formErrors.root && (
                <p className="form-error">{formErrors.root}</p>
              )}

              <label className="form-label">Full Name</label>
              <input
                className="admin-form-input"
                value={formData.full_name}
                onChange={(event) =>
                  updateField("full_name", event.target.value)
                }
                placeholder="Enter full name"
              />
              {formErrors.full_name && (
                <p className="form-error">{formErrors.full_name}</p>
              )}

              <label className="form-label">Email</label>
              <input
                className="admin-form-input"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="name@example.com"
                type="email"
              />
              {formErrors.email && (
                <p className="form-error">{formErrors.email}</p>
              )}

              {!isEditing && (
                <>
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="admin-form-input"
                      value={formData.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="At least 6 characters"
                      type={showPassword ? "text" : "password"}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="form-error">{formErrors.password}</p>
                  )}
                </>
              )}

              <div className="admin-form-grid">
                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="admin-form-input"
                    value={formData.role}
                    onChange={(event) =>
                      updateField("role", event.target.value as AdminUserRole)
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Country Code</label>
                  <select
                    className="admin-form-input"
                    value={formData.country_code}
                    onChange={(event) =>
                      updateField("country_code", event.target.value)
                    }
                  >
                    {countryCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="form-label">Phone</label>
              <input
                className="admin-form-input"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="9841000000"
              />
              {formErrors.phone && (
                <p className="form-error">{formErrors.phone}</p>
              )}

              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(event) =>
                    updateField("is_verified", event.target.checked)
                  }
                />
                <span>Mark user as verified</span>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 size={16} className="spin" />}
                  <span>{isEditing ? "Update User" : "Create User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Delete User</h2>
              <button
                className="modal-close-btn"
                onClick={() => setDeletingUser(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="admin-delete-text">
              Delete <strong>{getUserName(deletingUser)}</strong>? This action
              cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-secondary-btn"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="admin-danger-btn"
                onClick={handleDeleteUser}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 size={16} className="spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function UsersEmptyIcon() {
  return (
    <div className="admin-empty-icon">
      <Search size={26} />
    </div>
  );
}
