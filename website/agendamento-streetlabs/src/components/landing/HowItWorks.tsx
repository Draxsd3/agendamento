import { motion } from "framer-motion";

const steps = [
  {
    num: "1.",
    title: "Configure em 10 minutos",
    points: ["Cadastre seu estabelecimento", "Defina serviços e preços", "Comece a usar imediatamente"],
  },
  {
    num: "2.",
    title: "Compartilhe seu link",
    points: ["Link único e personalizado", "Cliente acessa do celular", "Sem precisar criar conta"],
  },
  {
    num: "3.",
    title: "Receba agendamentos",
    points: ["Confirmações automáticas", "Lembretes via WhatsApp", "Bloqueio inteligente de horários"],
  },
  {
    num: "4.",
    title: "Veja seu progresso real",
    points: ["Dashboard atualizado em tempo real", "Relatórios claros de evolução", "Identifique seus melhores clientes"],
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-3xl"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            É mais simples do que tu imagina, vê só:
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card border border-border rounded-3xl p-8"
            >
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-5">
                <span className="text-primary">{step.num}</span> {step.title}
              </h3>
              <ul className="space-y-2.5">
                {step.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-foreground/80">
                    <span className="text-primary font-bold mt-1">✦</span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
