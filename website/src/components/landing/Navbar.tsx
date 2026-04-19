import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Icon } from "@/components/Icon";

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Para quem é", href: "#personas" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

const WHATS = "https://wa.me/5513997071051?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-3 md:top-5 left-0 right-0 z-50 px-3 md:px-6">
      <div
        className={`max-w-6xl mx-auto rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border border-border shadow-[0_8px_30px_-8px_rgba(0,0,0,0.18)]"
            : "bg-background/70 backdrop-blur-md border border-border/60 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.12)]"
        }`}
      >
        <div className="flex items-center justify-between h-14 md:h-16 pl-5 pr-2 md:pl-7 md:pr-2.5">
          <a href="#" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-foreground">
              <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
              <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
            </svg>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">
              StreetLabs
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-foreground/75 hover:text-foreground transition-colors font-medium">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="/login"
              className="inline-flex items-center gap-2 border border-border text-foreground text-sm font-bold px-5 py-2.5 rounded-full hover:bg-secondary transition-colors uppercase tracking-wide"
            >
              Entrar
            </a>
            <a
              href={WHATS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink text-ink-foreground text-sm font-bold px-5 py-2.5 rounded-full hover:bg-ink/85 transition-colors uppercase tracking-wide"
            >
              Agendar demo
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground pr-3" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}>
            {mobileOpen ? <Icon as={X} size="lg" /> : <Icon as={Menu} size="lg" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden max-w-6xl mx-auto mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-[0_8px_30px_-8px_rgba(0,0,0,0.18)]"
          >
            <div className="p-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-foreground py-2 font-medium">
                  {l.label}
                </a>
              ))}
              <a href="/login" className="border border-border text-foreground font-bold py-3 rounded-full text-center uppercase tracking-wide">
                Entrar
              </a>
              <a href={WHATS} target="_blank" rel="noopener noreferrer" className="bg-ink text-ink-foreground font-bold py-3 rounded-full text-center mt-2 uppercase tracking-wide">
                Agendar demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
