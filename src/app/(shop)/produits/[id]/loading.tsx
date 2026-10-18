export default function Loading() {
  return (
    <>
      <section className="bg-brand-black pt-32 md:pt-36">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="h-3 w-64 animate-pulse rounded bg-white/10" />
        </div>
      </section>

      <section className="bg-white pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="aspect-square w-full animate-pulse rounded-3xl bg-brand-gray" />
            <div className="space-y-5">
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-brand-gray" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-brand-gray" />
              </div>
              <div className="h-12 w-3/4 animate-pulse rounded bg-brand-gray" />
              <div className="h-10 w-40 animate-pulse rounded bg-brand-gray" />
              <div className="h-24 w-full animate-pulse rounded bg-brand-gray" />
              <div className="h-14 w-full animate-pulse rounded-full bg-brand-gray" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}