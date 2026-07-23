import Sidebar from "@/app/(auth)/components/Sidebar";
import TopHeader from "@/app/(auth)/components/TopHeader";
import ProtectedRoute from "@/app/(auth)/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main-area">
          <TopHeader />
          <main className="dashboard-content">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
