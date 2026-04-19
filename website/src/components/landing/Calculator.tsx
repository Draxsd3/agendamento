import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Smartphone, FileSpreadsheet, MessageCircle, BookOpen, FileText, Users } from "lucide-react";
import { Icon } from "@/components/Icon";

const WHATS = "https://wa.me/5513997071051?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais";

const tools = [
  { name: "Caderno de agenda", icon: BookOpen },
  { name: "WhatsApp manual", icon: MessageCircle },
  { name: "Google Calendar", icon: Calendar },
  { name: "Planilhas", icon: FileSpreadsheet },
  { name: "Anotações no celular", icon: Smartphone },
  { name: "Cadastro em papel", icon: FileText },
  { name: "Recepcionista anotando", icon: Users },
];

const Calculator = () => {
  const [selected, setSelected] = useState<string[]>(["Caderno de agenda", "WhatsApp manual"]);
  const [days, setDays] = useState(22);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const result = useMemo(() => {
    // Each tool = ~12min/day saved
    const minutesPerDay = selected.length * 12;
    const totalMinutes = minutesPerDay * days;
    const hours = Math.floor(totalMinutes / 60);
    const fullDays = Math.floor(totalMinutes / (60 * 8));
    return { totalMinutes, hours, fullDays };
  }, [selected, days]);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-3xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">
            Quanto tempo você
            <br />
            pode <span className="underline-brush">economizar</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            Compare sua rotina atual com o que o StreetLabs faz por você — e descubra quanto tempo você ganha de volta.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto bg-card border border-border rounded-[2rem] p-8 md:p-12 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]">
          {/* Tools */}
          <div className="mb-10">
            <h3 className="font-display text-xl font-bold text-foreground mb-5">
              Quais ferramentas você usa atualmente?
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {tools.map((t) => {
                const isOn = selected.includes(t.name);
                return (
                  <button
                    key={t.name}
                    onClick={() => toggle(t.name)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm font-medium ${
                      isOn
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground/70 border-border hover:border-foreground/40"
                    }`}
                  >
                    <Icon as={t.icon} size="sm" />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days slider */}
          <div className="mb-10">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Quantos dias por mês você atende?
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-4xl font-bold text-primary">{days}</span>
              <span className="text-muted-foreground">dias</span>
            </div>
            <div className="relative h-2 rounded-full bg-muted">
              <div
                className="absolute h-full rounded-full bg-primary"
                style={{ width: `${((days - 5) / 25) * 100}%` }}
              />
              <input
                type="range"
                min={5}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-foreground border-4 border-background pointer-events-none"
                style={{ left: `${((days - 5) / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Result */}
          <div className="border-t border-border pt-10">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Seu resultado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Usando <span className="font-semibold text-foreground">{selected.length}</span> ferramenta{selected.length !== 1 ? "s" : ""} pra gerenciar sua agenda, com o StreetLabs você economiza:
            </p>

            <div className="font-display text-6xl md:text-8xl font-bold text-foreground leading-none mb-2">
              {result.hours}<span className="text-primary">h</span>
            </div>
            <div className="text-muted-foreground mb-8">por mês</div>

            <p className="text-foreground/80 mb-8">
              Isso equivale a <span className="font-bold text-primary">{result.fullDays} dias inteiros</span> de trabalho que você poderia usar atendendo mais clientes.
            </p>

            <a
              href={WHATS}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-ink text-ink-foreground font-bold px-7 py-4 rounded-full text-base hover:bg-ink/85 transition-colors uppercase tracking-wide"
            >
              Começar a economizar tempo
              <Icon as={ArrowRight} size="md" className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              Chega de perder seu tempo precioso com cadernos e planilhas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
