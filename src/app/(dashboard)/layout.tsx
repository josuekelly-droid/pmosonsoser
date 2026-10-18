import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClientSidebar } from "@/components/client/sidebar";
import { ClientTopbar } from "@/components/client/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion?next=/compte");
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-gray">
      <ClientTopbar
        userName={session.user.name || "Client"}
        userEmail={session.user.email || ""}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar Client */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <ClientSidebar
                userName={session.user.name || "Client"}
                userEmail={session.user.email || ""}
                typeCompte={(session.user as any).typeCompte || "B2C"}
              />
            </aside>

            {/* Contenu */}
            <div className="min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Mini Footer Client */}
      <footer className="border-t border-brand-black/5 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-brand-black/40 md:px-8">
          © {new Date().getFullYear()} PM Osons Oser — Espace client privé
        </div>
      </footer>
    </div>
  );
}