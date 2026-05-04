import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Icon } from "@/components/Icon";
import appDashboard from "@/assets/app-dashboard.png";

const bullets = [
  "Agenda, clientes e equipe num so lugar",
  "Lembretes automaticos de WhatsApp",
  "Cliente agenda em 30 segundos, sem login",
  "Relatorios de faturamento em tempo real",
  "E muito mais...",
];

const Hero = () => {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.95] tracking-tight mb-8 text-foreground">
              Menos planilhas,
              <br />
              mais <span className="underline-brush">faturamento</span>.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8">
              Chega de caderno, WhatsApp lotado e cadeira parada. Aqui sua agenda vira sistema:
              mais controle, menos no-show e clientes que voltam.
            </p>

            <ul className="space-y-2.5 mb-10">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-foreground/85">
                  <Icon as={Check} size="md" className="text-foreground mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/login"
                className="group inline-flex items-center gap-2 bg-ink text-ink-foreground font-bold px-7 py-4 rounded-full text-base hover:bg-ink/85 transition-colors uppercase tracking-wide"
              >
                Entrar na plataforma
                <Icon
                  as={ArrowRight}
                  size="md"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="/cadastro"
                className="inline-flex items-center gap-2 border border-border text-foreground font-bold px-7 py-4 rounded-full text-base hover:bg-secondary transition-colors uppercase tracking-wide"
              >
                Criar conta
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-background px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Painel real
                </span>
              </div>
              <img
                src={appDashboard}
                alt="Dashboard real do StreetLabs com agenda, faturamento e atendimentos"
                className="block h-auto w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
