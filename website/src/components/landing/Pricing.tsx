import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Icon } from "@/components/Icon";

const plans = [
  {
    name: "Starter",
    desc: "Pra comecar sua jornada",
    features: [
      "1 estabelecimento",
      "Ate 3 profissionais",
      "Agendamento online ilimitado",
      "Notificacoes por e-mail",
      "Relatorios basicos",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    desc: "Recursos completos pro seu negocio crescer",
    features: [
      "Tudo do plano Starter",
      "Profissionais ilimitados",
      "Lembretes automaticos por WhatsApp",
      "Relatorios avancados",
      "Personalizacao de marca",
      "Dominio personalizado",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    desc: "Pra redes e franquias",
    features: [
      "Tudo do plano Pro",
      "Multiplos estabelecimentos",
      "API e integracoes",
      "Onboarding dedicado",
      "Suporte prioritario",
      "SLA garantido",
    ],
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <section id="precos" className="py-20 md:py-28 bg-secondary/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-3xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">
            Escolha o plano <span className="underline-brush">ideal</span> pra voce
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece agora mesmo a organizar sua agenda com o StreetLabs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlight ? "bg-foreground text-background" : "bg-card border border-border"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Recomendado
                </div>
              )}
              <h3
                className={`font-display text-2xl font-bold mb-1 ${
                  plan.highlight ? "text-background" : "text-foreground"
                }`}
              >
                Plano {plan.name}
              </h3>
              <p
                className={`text-sm mb-6 ${
                  plan.highlight ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                {plan.desc}
              </p>
              <div
                className={`mb-6 pb-6 border-b ${
                  plan.highlight ? "border-background/15" : "border-border"
                }`}
              >
                <div className="font-display text-3xl font-bold">Sob consulta</div>
                <div
                  className={`text-xs mt-1 ${
                    plan.highlight ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  Criacao guiada para o seu negocio
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2.5 text-sm ${
                      plan.highlight ? "text-background/90" : "text-foreground/85"
                    }`}
                  >
                    <Icon
                      as={Check}
                      size="sm"
                      className={`mt-0.5 ${
                        plan.highlight ? "text-background" : "text-foreground"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="/cadastro"
                className={`group flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold transition-colors uppercase tracking-wide text-sm ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-foreground text-background hover:bg-foreground/85"
                }`}
              >
                Comecar agora
                <Icon as={ArrowRight} size="sm" className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
