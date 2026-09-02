import GuardedAdminLayout from '../guarded-layout';

export default function ProtectedAdminLayout({ children }) {
  return <GuardedAdminLayout>{children}</GuardedAdminLayout>;
}
