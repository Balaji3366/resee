export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-amber/20 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-amber/20 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-[32px] border border-amber/20 bg-panel p-10 shadow-2xl">
          {children}
        </div>
      </div>
    </main>
  );
}
