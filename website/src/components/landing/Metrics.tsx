import { useState } from "react";
import { motion } from "framer-motion";

const metrics = [
  {
    value: "-87%",
    label: "de no-shows",
    detail: "Lembretes automáticos via WhatsApp reduzem drasticamente as faltas. Sua cadeira não fica mais parada.",
  },
  {
    value: "+40%",
    label: "no faturamento",
    detail: "Mais agendamentos online, ticket médio maior e clientes recorrentes — visíveis no seu dashboard.",
  },
  {
    value: "+2h",
    label: "economizadas por dia",
    detail: "Pare de responder WhatsApp confirmando horário. O sistema agenda, confirma e lembra sozinho.",
  },
];

const Metrics = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {metrics.map((m, i) => (
            <motion.button
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
              className="group relative p-8 md:p-10 rounded-3xl bg-card border border-border text-left hover:border-primary/50 transition-all overflow-hidden min-h-[220px]"
            >
              <div className="font-display text-6xl md:text-7xl font-bold text-foreground leading-none mb-3 group-hover:text-primary transition-colors">
                {m.value}
              </div>
              <div className="text-lg md:text-xl text-foreground/80 font-medium">{m.label}</div>

              {active === i && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 p-8 md:p-10 bg-card/95 backdrop-blur flex items-center"
                >
                  <p className="text-foreground/85 leading-relaxed text-base">{m.detail}</p>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          <span className="md:hidden">Toque nos números para mais informações</span>
          <span className="hidden md:inline">Passe o mouse sobre os números para mais informações</span>
        </p>
      </div>
    </section>
  );
};

export default Metrics;
