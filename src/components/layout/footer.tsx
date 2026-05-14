import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const footerLinks = {
  Community: [
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Open CFPs", href: "/cfps" },
  ],
  Contribute: [
    { label: "GitHub", href: "https://github.com/kubeflow", external: true },
    { label: "Good First Issues", href: "https://github.com/kubeflow/kubeflow/labels/good%20first%20issue", external: true },
  ],
  Resources: [
    { label: "About", href: "/about" },
    { label: "Kubeflow Docs", href: "https://www.kubeflow.org/docs/", external: true },
    { label: "CNCF", href: "https://www.cncf.io/", external: true },
    { label: "Code of Conduct", href: "/about#code-of-conduct" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white font-bold text-[15px]">KF</span>
              </div>
              <span className="font-semibold text-text-primary">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              The local developer community for Kubeflow in India.
              Learn, contribute, and grow together.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Open source under Apache 2.0 License.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/kubeflow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="GitHub"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="https://x.com/kubeflow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Twitter"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
