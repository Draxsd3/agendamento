import { motion } from "framer-motion";
import { Zap, BarChart3, Brain, CalendarCheck, Wallet, Target, TrendingUp } from "lucide-react";
import { Icon } from "@/components/Icon";

const pillars = [
  {
    icon: Zap,
    title: "Agenda em tempo real",
    desc: "Cada agendamento aparece instantaneamente para todos os profissionais. Sem conflito, sem encavalamento.",
  },
  {
    icon: BarChart3,
    title: "Mapa de Crescimento",
    desc: "Visualize exatamente onde você fatura mais, qual horário lota e quais serviços são mais pedidos.",
  },
  {
    icon: Brain,
    title: "Sistema Inteligente",
    desc: "O sistema analisa seus dados enquanto você foca no que importa: atender bem seus clientes.",
  },
];

const Algorithm = () => {
  return (
    <section className="ink-section bg-background text-foreground py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg-dark opacity-50" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-4xl mx-auto"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 font-semibold">
            ✦ Sistema StreetLabs ✦
          </div>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
            Algoritmo
            <br />
            <span className="text-gradient">Tempo–Receita</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Que transforma cada minuto da sua agenda em dados precisos de crescimento.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-card border border-border rounded-3xl p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-foreground/10 border border-foreground/20 flex items-center justify-center mb-6">
                <Icon as={p.icon} size="md" className="text-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <h3 className="font-display text-3xl md:text-4xl font-bold mb-10">
            Acorde sabendo exatamente:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { icon: CalendarCheck, t: "O que está marcado" },
              { icon: Wallet, t: "Quanto vai faturar" },
              { icon: Target, t: "Onde focar" },
              { icon: TrendingUp, t: "Como está crescendo" },
            ].map((item) => (
              <div key={item.t} className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-foreground/10 border border-foreground/20 flex items-center justify-center mb-4">
                  <Icon as={item.icon} size="lg" className="text-foreground" />
                </div>
                <div className="text-sm md:text-base text-foreground font-medium">{item.t}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Algorithm;
