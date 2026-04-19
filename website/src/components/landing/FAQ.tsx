import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/Icon";

const faqs = [
  {
    q: "Como o StreetLabs me ajuda a organizar melhor?",
    a: "Centraliza agenda, clientes, equipe e relatórios em um só lugar. Você para de usar caderno + WhatsApp + planilha e ganha um sistema único, com lembretes automáticos e visão real do faturamento.",
  },
  {
    q: "Quanto tempo leva pra aprender a usar?",
    a: "Em média 10 a 20 minutos pra colocar tudo no ar. A interface foi desenhada pra ser intuitiva — se você usa WhatsApp, usa StreetLabs.",
  },
  {
    q: "Como sei que funciona pro meu negócio?",
    a: "Agendamos uma demonstração personalizada gratuita pelo WhatsApp. Mostramos a plataforma com seu cenário real antes de qualquer cobrança.",
  },
  {
    q: "Funciona offline?",
    a: "O sistema é online (precisa de internet), mas roda perfeitamente no celular do cliente e no seu painel de gestão.",
  },
  {
    q: "O cliente precisa criar conta para agendar?",
    a: "Não. O agendamento é direto: cliente escolhe serviço, profissional, horário e confirma com nome e contato. Sem fricção.",
  },
  {
    q: "Como funcionam os lembretes por WhatsApp?",
    a: "A partir do plano Pro, lembretes automáticos são enviados antes do horário marcado. Reduz no-shows em até 70% sem você precisar mexer um dedo.",
  },
  {
    q: "Posso usar minha marca e domínio?",
    a: "Sim. Nos planos Pro e Enterprise você personaliza com logo, cores da sua marca e pode usar domínio próprio (ex: agenda.suabarbearia.com.br).",
  },
  {
    q: "Quanto custa o StreetLabs?",
    a: "Os valores são apresentados na demonstração personalizada, ajustados ao tamanho do seu negócio e plano escolhido. Sem fidelidade.",
  },
  {
    q: "Existe garantia?",
    a: "Sim. Se em até 30 dias você não estiver satisfeito, devolvemos 100% do valor sem perguntas.",
  },
];

const FAQItem = ({ q, a, idx }: { q: string; a: string; idx: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: idx * 0.04 }}
      className="border-b border-border"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left"
      >
        <span className="font-display text-lg md:text-xl font-bold text-foreground pr-4">{q}</span>
        <Icon
          as={ChevronDown}
          size="md"
          className={`text-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60 pb-6" : "max-h-0"}`}>
        <p className="text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </motion.div>
  );
};

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Perguntas Frequentes
          </h2>
        </motion.div>

        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
