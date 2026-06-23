import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="profile-background">
      <section className="profile-card">
        <h1 className="profile-title">Unauthorized</h1>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "24px" }}>
          You do not have permission to view this page.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none" }}>
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}
