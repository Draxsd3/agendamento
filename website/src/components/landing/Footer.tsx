import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size="md" />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Agendamentos online para barbearias, salões, estúdios e qualquer negócio que vive de
              agenda. Seu cliente agenda, você só atende.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-4">Produto</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="#resultados" className="hover:text-primary transition-colors">Resultados</a></li>
              <li><a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a></li>
              <li><a href="#precos" className="hover:text-primary transition-colors">Planos</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">Entrar</a></li>
              <li><a href="/cadastro" className="hover:text-primary transition-colors">Criar conta grátis</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-4">Contato</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li>
                <a href="https://wa.me/5513997071051" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  WhatsApp · +55 13 99707-1051
                </a>
              </li>
              <li>
                <a href="mailto:contato@agenclick.com" className="hover:text-primary transition-colors">
                  contato@agenclick.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-muted-foreground text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 AgenClick. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <a href="/cadastro" className="hover:text-primary transition-colors">Criar conta grátis</a>
            <a href="/login" className="hover:text-primary transition-colors">Entrar</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
