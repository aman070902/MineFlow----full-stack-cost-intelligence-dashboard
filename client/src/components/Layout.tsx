import { BarChart3, Boxes, Gauge, Hammer, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/projects", label: "Projects", icon: Hammer },
  { to: "/compare", label: "Compare", icon: Layers3 },
  { to: "/scenarios", label: "Scenario Builder", icon: BarChart3 },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-ink text-ore">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-copper text-ink shadow-soft">
              <Boxes size={24} />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-wide text-white">MineFlow</div>
              <div className="text-xs uppercase tracking-[0.2em] text-steel">Cost Intelligence</div>
            </div>
          </NavLink>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm transition ${
                      isActive
                        ? "border-copper/60 bg-copper/15 text-white"
                        : "border-transparent text-steel hover:border-line hover:bg-panel2 hover:text-white"
                    }`
                  }
                >
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="w-full px-6 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
