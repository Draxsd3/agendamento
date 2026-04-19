import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/Icon";

const WHATS = "https://wa.me/5513997071051?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o";

const CTASection = () => {
  return (
    <section className="ink-section bg-background text-foreground py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg-dark opacity-50" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.98]">
            Pronto pra parar de
            <br />
            <span className="text-gradient">perder horários</span>?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Agende uma demonstração personalizada pelo WhatsApp e veja o StreetLabs funcionando com a realidade do seu negócio.
          </p>
          <a
            href={WHATS}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full text-base hover:bg-primary/90 transition-all uppercase tracking-wide"
          >
            Falar no WhatsApp
            <Icon as={ArrowRight} size="md" className="group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="mt-6 text-sm text-muted-foreground">
            +55 13 99707-1051 · Resposta em até 1h em horário comercial
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
