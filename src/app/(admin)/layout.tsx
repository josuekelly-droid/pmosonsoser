import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/connexion?next=/admin");
  }

  return (
    <div className="flex min-h-screen bg-brand-gray selection:bg-brand-red/20 selection:text-brand-black">
      {/* Sidebar flottante */}
      <AdminSidebar
        userName={session.user.name || "Admin"}
        userEmail={session.user.email || ""}
      />

      {/* Contenu principal */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[300px]">
        <AdminTopbar
          userName={session.user.name || "Admin"}
          userEmail={session.user.email || ""}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}