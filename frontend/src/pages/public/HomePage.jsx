import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarCheck2, CreditCard, Layers3, ShieldCheck, Sparkles, Users2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarCheck2,
    title: 'Agenda online de verdade',
    description: 'Agendamento em poucos cliques, confirmação automática e operação organizada em um só painel.',
  },
  {
    icon: Users2,
    title: 'Equipe, clientes e serviços',
    description: 'Controle profissionais, histórico do cliente, serviços, planos e fluxo de atendimento sem planilhas.',
  },
  {
    icon: CreditCard,
    title: 'Assinaturas e cobrança',
    description: 'Planos recorrentes, checkout e estrutura pronta para operação financeira com Asaas.',
  },
];

const PLAN_ROWS = [
  {
    name: 'Essencial',
    price: 'R$ 49',
    description: 'Para autônomos e estúdios menores começarem rápido.',
  },
  {
    name: 'Profissional',
    price: 'R$ 99',
    description: 'Para operações em crescimento com equipe, planos e gestão mais completa.',
  },
  {
    name: 'Premium',
    price: 'Sob consulta',
    description: 'Para estruturas maiores, múltiplas unidades e operação avançada.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg pointer-events-none opacity-70" />
      <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-violet-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 h-[32rem] w-[32rem] rounded-full bg-violet-brand/5 blur-3xl pointer-events-none" />

      <nav className="relative z-20 px-3 md:px-6 pt-4 md:pt-6">
        <div className="max-w-6xl mx-auto rounded-full bg-canvas/80 backdrop-blur-xl border border-ink-line shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between h-14 md:h-16 pl-5 pr-2 md:pl-7 md:pr-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink">
                <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
                <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
              </svg>
              <span className="font-display font-bold text-ink text-lg tracking-tight">StreetLabs</span>
            </Link>

            <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              <a href="#recursos" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">
                Recursos
              </a>
              <a href="#planos" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">
                Planos
              </a>
              <Link to="/login" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">
                Entrar
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full border border-ink-line hover:bg-white transition-colors uppercase tracking-wide"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 bg-ink text-canvas text-xs font-bold px-4 md:px-5 py-2.5 rounded-full hover:bg-ink/85 transition-colors uppercase tracking-wide"
              >
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="px-4 md:px-8 pt-12 md:pt-20 pb-16">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft mb-6">
                <Sparkles size={13} className="text-violet-brand" />
                SaaS de agendamento para barbearias, estúdios e salões
              </div>

              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-ink mb-6">
                O website vende.
                <br />
                O painel <span className="underline-brush">organiza tudo</span>.
              </h1>

              <p className="text-lg text-ink-soft max-w-2xl leading-relaxed mb-8">
                Tenha uma entrada comercial mais profissional no domínio principal e um sistema completo
                para agenda, clientes, equipe, planos e faturamento no mesmo ecossistema.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/cadastro" className="btn-ink group">
                  Criar conta
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-line bg-white px-7 py-4 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors"
                >
                  Entrar no sistema
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up">
              <div className="rounded-[2rem] border border-ink-line bg-white shadow-[0_25px_80px_-30px_rgba(0,0,0,0.22)] overflow-hidden">
                <div className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-semibold">Painel StreetLabs</p>
                    <h2 className="font-display text-2xl font-bold text-ink mt-1">Tudo em um só fluxo</h2>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-violet-brand/10 flex items-center justify-center text-violet-brand">
                    <Layers3 size={20} />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl border border-ink-line bg-canvas px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-soft">Agenda de hoje</p>
                        <p className="font-display text-3xl font-bold text-ink">18 atendimentos</p>
                      </div>
                      <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-canvas">
                        +24%
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-ink-line bg-white px-4 py-4">
                      <p className="text-xs uppercase tracking-wide text-ink-soft">Clientes ativos</p>
                      <p className="font-display text-2xl font-bold text-ink mt-1">1.284</p>
                    </div>
                    <div className="rounded-2xl border border-ink-line bg-white px-4 py-4">
                      <p className="text-xs uppercase tracking-wide text-ink-soft">MRR estimado</p>
                      <p className="font-display text-2xl font-bold text-ink mt-1">R$ 12.480</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-ink-line bg-white px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="text-violet-brand mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-ink">Domínio principal com cara de produto</p>
                        <p className="text-sm text-ink-soft mt-1">
                          O visitante entra pelo website, entende o valor do sistema e só depois segue para login ou cadastro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="px-4 md:px-8 py-8 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-semibold mb-3">Recursos principais</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight">
                Feito para vender melhor e operar com mais controle.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-3xl border border-ink-line bg-white p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.2)]">
                  <div className="h-12 w-12 rounded-2xl bg-violet-brand/10 text-violet-brand flex items-center justify-center mb-5">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-3">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="px-4 md:px-8 py-12 md:py-16">
          <div className="max-w-6xl mx-auto rounded-[2rem] border border-ink-line bg-white p-6 md:p-10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-semibold mb-3">Planos sugeridos</p>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight">
                  Três camadas claras para vender o SaaS.
                </h2>
              </div>
              <Link to="/cadastro" className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-violet-brand transition-colors">
                Começar agora <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {PLAN_ROWS.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl border p-6 ${
                    index === 1 ? 'bg-ink text-canvas border-ink' : 'bg-canvas border-ink-line'
                  }`}
                >
                  <p className={`text-xs uppercase tracking-[0.2em] font-semibold ${index === 1 ? 'text-canvas/70' : 'text-ink-soft'}`}>
                    {plan.name}
                  </p>
                  <p className="font-display text-4xl font-bold mt-3">{plan.price}</p>
                  <p className={`text-sm leading-relaxed mt-4 ${index === 1 ? 'text-canvas/80' : 'text-ink-soft'}`}>
                    {plan.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
