const items = [
  "AGENDAMENTO",
  "ORGANIZAÇÃO",
  "BARBEARIA",
  "CONTROLE",
  "EFICIÊNCIA",
  "TATTOO",
  "PROGRESSO",
  "RESULTADO",
  "SALÕES",
];

const Marquee = () => {
  const list = [...items, ...items];
  return (
    <section className="py-8 md:py-10 border-y border-border bg-secondary/40 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-6 md:gap-8 px-6 md:px-8">
            <span className="font-display text-2xl md:text-4xl font-bold text-foreground">
              {item}
            </span>
            <span className="text-primary text-2xl md:text-4xl font-bold">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Marquee;
