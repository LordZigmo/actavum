import Link from "next/link";
import { Clock, FileBarChart, Link2, Sparkles } from "lucide-react";

// Brand mark — the Actavum "A" drawn as a connected graph (mirrors the in-app logo).
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M13 4.5 L5 21.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <path d="M13 4.5 L21 21.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <path d="M8.3 14.5 L17.7 14.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <circle cx="5" cy="21.5" r="2.6" fill="var(--color-ink-950)" stroke="var(--color-accent)" strokeWidth="1.5" />
      <circle cx="21" cy="21.5" r="2.6" fill="var(--color-ink-950)" stroke="var(--color-accent)" strokeWidth="1.5" />
      <circle cx="8.3" cy="14.5" r="1.5" fill="var(--color-accent)" />
      <circle cx="17.7" cy="14.5" r="1.5" fill="var(--color-accent)" />
      <circle cx="13" cy="4.5" r="3.1" fill="var(--color-ink-950)" stroke="var(--color-accent-bright)" strokeWidth="1.7" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Link2,
    title: "Map the evidence",
    body: "Drop people, documents, and events onto a living graph and connect them as the case takes shape.",
  },
  {
    icon: Clock,
    title: "Build the timeline",
    body: "Every linked source slots into an ordered timeline, so the sequence of events is never in doubt.",
  },
  {
    icon: FileBarChart,
    title: "Generate the report",
    body: "Produce a citation-first report where every statement links back to the source that backs it.",
  },
];

export default function Landing() {
  return (
    <main className="relative h-full overflow-y-auto text-ink-200">
      {/* ambient accent glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% -10%, color-mix(in oklch, var(--color-accent) 16%, transparent), transparent)",
        }}
      />

      <div className="relative z-10">
        {/* nav */}
        <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-white">Actavum</span>
          </div>
          <Link
            href="/demo"
            className="rounded-lg border border-ink-700/70 bg-ink-900/50 px-3.5 py-1.5 text-[13px] font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-white"
          >
            Open demo
          </Link>
        </header>

        {/* hero */}
        <section className="mx-auto max-w-3xl px-6 pb-12 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent-bright">
            <Sparkles size={12} /> Investigation workspace · early prototype
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Turn an evidence board into a source-backed report.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-ink-400 sm:text-base">
            Actavum maps people, documents, and events on a living graph — then weaves them into a
            timeline and a citation-first investigative report. Build the board, connect the
            evidence, generate the report.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-ink-950 shadow-[0_0_24px_-6px_var(--color-accent)] transition-colors hover:bg-accent-bright"
            >
              Open the live demo <span aria-hidden>→</span>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center rounded-lg border border-ink-700/70 bg-ink-900/40 px-5 py-2.5 text-[14px] font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-white"
            >
              How it works
            </a>
          </div>
        </section>

        {/* features */}
        <section id="how" className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl border border-ink-800 bg-ink-950/60 text-accent-bright">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{body}</p>
              </div>
            ))}
          </div>

          {/* secondary CTA */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-ink-800 bg-ink-900/40 px-6 py-6 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="text-[15px] font-semibold text-white">See it in motion</h3>
              <p className="mt-1 text-[13px] text-ink-400">
                Explore the working prototype — a sample case, fully interactive.
              </p>
            </div>
            <Link
              href="/demo"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-accent-bright"
            >
              Launch demo <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t border-ink-800/70">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-[12px] text-ink-600 sm:flex-row">
            <div className="flex items-center gap-2">
              <LogoMark size={18} />
              <span>Actavum · work in progress</span>
            </div>
            <span className="font-mono">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
