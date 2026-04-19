import { motion } from "framer-motion";

const problems = [
  "Você perde horas no WhatsApp confirmando horários",
  "Nunca sabe exatamente quem é seu melhor cliente",
  "A ansiedade aumenta a cada cadeira parada",
  "O tempo precioso escorre entre os dedos",
  "O crescimento do negócio parece cada vez mais distante",
];

const Paradox = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.05]">
            Você sabe o que é o
            <br />
            <span className="underline-brush">paradoxo da agenda</span>?
          </h2>

          <div className="space-y-5 text-foreground/85 text-lg leading-relaxed max-w-2xl">
            <p>
              Não? Vou te explicar... Sabe aquela sensação de trabalhar o dia inteiro,
              mas no fim do mês não saber se realmente cresceu?
            </p>
            <p className="font-semibold text-foreground">Não é sua culpa...</p>
            <p>
              O problema real é que quanto mais você tenta se organizar usando
              cadernos, planilhas e WhatsApp, menos tempo sobra para realmente atender.
            </p>
            <p>
              É como tentar esvaziar um barco usando um balde furado.
              Você se esforça muito, mas os resultados não aparecem.
            </p>
            <p className="font-semibold text-foreground">Veja só:</p>
          </div>
        </motion.div>

        <div className="space-y-5">
          {problems.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-baseline gap-6"
            >
              <div className="font-display text-5xl md:text-6xl font-bold text-primary/30 w-14 shrink-0">
                {i + 1}
              </div>
              <div className="text-lg md:text-xl text-foreground/90 pt-2">{p}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <p className="text-2xl md:text-3xl font-display font-medium text-foreground">
            Então criamos o...
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Paradox;
