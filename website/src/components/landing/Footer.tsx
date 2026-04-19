const Footer = () => {
  return (
    <footer className="border-t border-border py-16 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-foreground">
                <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
                <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
              </svg>
              <span className="font-display font-bold text-foreground text-lg">StreetLabs</span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Agendamento inteligente para barbearias, estúdios de tatuagem, salões e espaços
              criativos que vivem de agenda.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-4">Produto</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-foreground transition-colors">Planos</a></li>
              <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="/login" className="hover:text-foreground transition-colors">Entrar</a></li>
              <li><a href="/cadastro" className="hover:text-foreground transition-colors">Criar conta</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-4">Contato</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li>
                <a href="https://wa.me/5513997071051" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  WhatsApp · +55 13 99707-1051
                </a>
              </li>
              <li>
                <a href="https://streetlabs.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  streetlabs.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-muted-foreground text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 StreetLabs. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <a href="/cadastro" className="hover:text-foreground transition-colors">Começar</a>
            <a href="/login" className="hover:text-foreground transition-colors">Entrar</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
