import ProtectedRoute from "@/components/ProtectedRoute";

export default function ATSLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      {children}
    </ProtectedRoute>
  );
}
