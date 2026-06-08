export default function FormsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
        >
          Formulários
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
          Formulários de captação e onboarding
        </p>
      </div>

      <div
        className="rounded-xl p-8 flex flex-col items-center justify-center gap-3"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          minHeight: "400px",
        }}
      >
        <p
          className="text-lg font-medium"
          style={{ color: "var(--fg-2)", fontFamily: "var(--font-display)" }}
        >
          Em breve
        </p>
        <p
          className="text-sm"
          style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
        >
          Esta funcionalidade está em desenvolvimento
        </p>
      </div>
    </div>
  );
}
