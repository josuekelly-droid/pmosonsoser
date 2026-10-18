export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-brand-black pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-12 w-64 animate-pulse rounded bg-white/10 md:h-16 md:w-96" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/5" />
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="bg-brand-gray py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}