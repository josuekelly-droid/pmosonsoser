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
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0B] text-white overflow-hidden">
      {/* Éléments de fond décoratifs Dark Luxury haute immersion */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.1),rgba(255,255,255,0))]" />
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-brand-red/10 blur-[140px] pointer-events-none" />

      {/* Topbar */}
      <ClientTopbar
        userName={session.user.name || "Client"}
        userEmail={session.user.email || ""}
      />

      <main className="relative z-10 flex-1">
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

            {/* Contenu principal de la page courante */}
            <div className="min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Mini Footer Client Dark Luxury */}
      <footer className="relative z-10 border-t border-white/10 bg-neutral-900/40 py-6 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 text-center font-mono text-xs text-neutral-500 md:px-8">
          &copy; {new Date().getFullYear()} PM Osons Oser — Espace client sécurisé
        </div>
      </footer>
    </div>
  );
}