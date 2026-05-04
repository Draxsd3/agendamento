import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/Icon";
import appClient from "@/assets/app-client.png";
import appSettings from "@/assets/app-settings.png";

const FeatureSections = () => {
  return (
    <section id="funcionalidades" className="py-20 md:py-28 space-y-24">
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
              Visao do cliente
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-5">
              Cliente agenda em <span className="underline-brush">30 segundos</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Link unico, design profissional e fluxo simples. Seu cliente escolhe servico,
              profissional e horario sem precisar baixar app nem criar conta.
            </p>
            <div className="space-y-3">
              {[
                "Mostra disponibilidade em tempo real",
                "Funciona perfeitamente no celular",
                "Confirmacao automatica por WhatsApp",
                "Cliente recebe lembrete antes do horario",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2.5 text-foreground/85">
                  <span className="text-primary font-bold mt-1">*</span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
              <div className="border-b border-border bg-background px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Area do cliente real
              </div>
              <img
                src={appClient}
                alt="Area real do cliente no StreetLabs com proximo agendamento e plano"
                className="block aspect-[16/10] w-full object-cover object-left-top"
              />
            </div>
          </div>
        </motion.div>
      </div>

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
              <div className="border-b border-border bg-background px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Personalizacao real
              </div>
              <img
                src={appSettings}
                alt="Tela real de configuracoes e preview do cliente no StreetLabs"
                className="block aspect-[16/10] w-full object-cover object-left-top"
              />
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
              Cada profissional com sua agenda, servicos e horarios. Voce gerencia tudo de um
              lugar so, sem confusao e sem horario sobreposto.
            </p>
            <a
              href="/cadastro"
              className="group inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              Criar conta e testar
              <Icon as={ArrowRight} size="sm" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSections;
