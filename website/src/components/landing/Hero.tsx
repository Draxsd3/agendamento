import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Icon } from "@/components/Icon";
import { ClickCursor } from "@/components/Logo";
import HeroIllustration from "./HeroIllustration";

const Hero = () => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-soft opacity-40 pointer-events-none" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 bg-background border border-border rounded-full pl-2 pr-5 py-2 mb-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]"
            >
              <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <ClickCursor size={16} className="text-primary" />
              </span>
              <span className="text-sm font-medium text-foreground/80">
                Agendamentos online para o seu negócio
              </span>
            </motion.div>

            <h1 className="font-display text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-extrabold leading-[0.95] tracking-tight mb-7 text-foreground">
              Seu cliente agenda.
              <br />
              <span className="text-primary">Você só atende.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed mb-10">
              Menos faltas, mais controle e sua agenda{" "}
              <br className="hidden sm:block" />
              sempre organizada.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/cadastro"
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-7 py-4 rounded-2xl text-base hover:bg-primary/90 transition-all shadow-red hover:-translate-y-0.5"
              >
                Criar conta grátis
                <Icon
                  as={ArrowRight}
                  size="md"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="#como-funciona"
                className="group inline-flex items-center gap-2 bg-background border border-border text-foreground font-semibold px-6 py-4 rounded-2xl text-base hover:border-foreground/40 hover:bg-secondary transition-all"
              >
                <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:border-primary transition-colors">
                  <Icon as={Play} size="sm" className="text-foreground group-hover:text-primary-foreground ml-0.5 transition-colors" />
                </span>
                Ver como funciona
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full"
          >
            <HeroIllustration className="w-full h-auto max-w-[640px] mx-auto" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
