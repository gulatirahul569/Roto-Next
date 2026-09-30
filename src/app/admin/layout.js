import AdminShell from "../../components/admin/AdminShell";

export const metadata = {
  title: "Roto Admin",
  description: "Roto administration panel",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}