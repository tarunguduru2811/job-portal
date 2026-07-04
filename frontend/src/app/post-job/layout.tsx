import ProtectedRoute from "@/components/ProtectedRoute";

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
      {children}
    </ProtectedRoute>
  );
}
