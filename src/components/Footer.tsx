export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-slate-800/80 bg-slate-950/90 py-8 text-xs text-slate-400"
    >
      <div className="section-max-width flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Tara Forge
          </p>
          <p className="mt-1 text-xs text-slate-300">
            A 3D printing studio inspired by “Tara” (Star) — focused on prototypes, custom parts, and functional prints. Forged in the Stars.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-[11px] text-slate-400">
            Send an STL/STEP and a note about size, material, and finish.
          </p>
          <a
            href="mailto:taraforgeindia@gmail.com"
            className="text-[11px] font-semibold text-celestial-accent hover:text-celestial-accent-strong"
          >
            taraforgeindia@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
