import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/Icon";
import appClient from "@/assets/mockup-client.png";
import appSettings from "@/assets/mockup-settings.png";

const FeatureSections = () => {
  return (
    <section id="funcionalidades" className="py-20 md:py-28 space-y-24">
      {/* Feature 1 */}
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <div className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
              Visão do cliente
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-5">
              Cliente agenda em <span className="underline-brush">30 segundos</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Link único, design profissional e fluxo simples. Seu cliente escolhe serviço,
              profissional e horário — sem precisar baixar app nem criar conta.
            </p>
            <div className="space-y-3">
              {[
                "Mostra disponibilidade em tempo real",
                "Funciona perfeitamente no celular",
                "Confirmação automática por WhatsApp",
                "Cliente recebe lembrete antes do horário",
              ].map((b) => (
                <div key={b} className="flex items-start gap-2.5 text-foreground/85">
                  <span className="text-primary font-bold mt-1">✦</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
              <img src={appClient} alt="Visão do cliente agendando" className="w-full h-auto block" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature 2 — só aqui muda só a ordem */}
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="relative lg:order-1 order-2">
            <div className="absolute -inset-6 bg-gradient-to-bl from-primary/20 to-transparent rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
              <img src={appSettings} alt="Configurações da equipe" className="w-full h-auto block" />
            </div>
          </div>
          <div className="lg:order-2 order-1">
            <div className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
              Painel do dono
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-5">
              Controle total da <span className="underline-brush">sua equipe</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Cada profissional com sua agenda, serviços e horários. Você gerencia tudo de um
              lugar só, sem confusão e sem horário sobreposto.
            </p>
            <a
              href="https://wa.me/5513997071051?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              Quero ver funcionando
              <Icon as={ArrowRight} size="sm" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSections;
