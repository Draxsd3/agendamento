import { motion } from "framer-motion";
import appDashboard from "@/assets/mockup-dashboard.png";
import appClient from "@/assets/mockup-client.png";
import appSettings from "@/assets/mockup-settings.png";

const shots = [
  {
    src: appDashboard,
    title: "Dashboard do dono",
    desc: "Faturamento, agenda e equipe em tempo real.",
  },
  {
    src: appClient,
    title: "Página do cliente",
    desc: "Agendamento em 30 segundos, sem login.",
  },
  {
    src: appSettings,
    title: "Configurações da equipe",
    desc: "Cada profissional com sua agenda e serviços.",
  },
];

const Showcase = () => {
  return (
    <section className="py-20 md:py-28 bg-foreground text-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
            O sistema por dentro
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Feito pra rodar no <span className="underline-brush">corre real</span> do seu negócio.
          </h2>
          <p className="text-background/70 text-lg mt-5 leading-relaxed">
            Cada tela pensada pra quem atende cliente todo dia. Sem firula, sem curva de aprendizado.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {shots.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="relative rounded-3xl overflow-hidden border border-background/15 bg-background/5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] aspect-[4/5]">
                <img
                  src={s.src}
                  alt={s.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-5">
                <h3 className="font-display text-2xl font-bold tracking-tight">{s.title}</h3>
                <p className="text-background/65 text-sm mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
