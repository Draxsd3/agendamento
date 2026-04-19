import { motion } from "framer-motion";
import { Scissors, Brush, Wind, Warehouse } from "lucide-react";
import { Icon } from "@/components/Icon";

const personas = [
  {
    icon: Scissors,
    title: "Barbeiro",
    desc: "Cadeira cheia, equipe sincronizada e zero brigas por horário sobreposto. Acabe com o WhatsApp lotado pra confirmar corte.",
  },
  {
    icon: Brush,
    title: "Tatuador",
    desc: "Sessões longas, sinal de pagamento e portfólio por artista. Agenda profissional pra quem leva arte a sério.",
  },
  {
    icon: Wind,
    title: "Cabeleireiro",
    desc: "Múltiplos serviços, durações diferentes, profissionais especializados. Sua agenda inteligente do jeito certo.",
  },
  {
    icon: Warehouse,
    title: "Dono de espaço",
    desc: "Coworking, estúdio fotográfico, sala de ensaio. Reservas online e controle total da ocupação do seu espaço.",
  },
];

const Personas = () => {
  return (
    <section id="personas" className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-3xl"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Pra ti que é...
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-card border border-border rounded-3xl p-7 hover:border-primary/40 hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-colors">
                <Icon as={p.icon} size="lg" className="text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Personas;
