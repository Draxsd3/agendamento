import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Icon } from "@/components/Icon";
import Logo from "@/components/Logo";

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Resultados", href: "#resultados" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
          : "bg-background/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center" aria-label="AgenClick — Página inicial">
            <Logo size="md" />
          </a>

          <div className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[15px] text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="/login"
              className="inline-flex items-center text-foreground text-[15px] font-semibold px-4 py-2.5 hover:text-primary transition-colors"
            >
              Entrar
            </a>
            <a
              href="/cadastro"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-red hover:-translate-y-0.5"
            >
              Criar conta grátis
              <Icon as={ArrowRight} size="sm" className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
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
            className="md:hidden bg-background border-t border-border"
          >
            <div className="container py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground py-3 font-medium border-b border-border/60"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/login"
                className="text-foreground py-3 font-semibold mt-2 text-center border border-border rounded-xl"
              >
                Entrar
              </a>
              <a
                href="/cadastro"
                className="bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-center mt-2 inline-flex items-center justify-center gap-2"
              >
                Criar conta grátis
                <Icon as={ArrowRight} size="sm" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
