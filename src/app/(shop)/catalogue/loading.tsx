export default function Loading() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      {/* Hero skeleton */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-12 w-64 animate-pulse rounded-2xl bg-white/10 md:h-16 md:w-96" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-xl bg-white/5" />
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="relative py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <div className="h-[500px] animate-pulse rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}