import AdminAuthGuard from './AdminAuthGuard';
import AdminShell from './AdminShell';

export default function GuardedAdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
