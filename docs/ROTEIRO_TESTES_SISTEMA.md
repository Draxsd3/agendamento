# Roteiro de testes completo do sistema

Este roteiro cobre os fluxos principais e as regressoes criticas do sistema de agendamento. Use antes de publicar uma versao ou depois de qualquer ajuste em login, cadastro, agenda, planos, financeiro, personalizacao, Asaas ou permissoes.

## 1. Preparacao

### 1.1 Ambiente

Teste sempre em um ambiente definido:

- Producao frontend: `https://agendamento-one-black.vercel.app`
- Backend de producao usado pelo frontend: conferir no bundle ou variavel `VITE_API_URL`
- Local frontend: `http://localhost:5173`
- Local backend: `http://localhost:3001/api/v1`

Para testar localmente:

```powershell
cd C:\Users\draxs\Desktop\agendamento\backend
npm install
npm run dev
```

Em outro terminal:

```powershell
cd C:\Users\draxs\Desktop\agendamento\frontend
npm install
npm run dev
```

Antes de testar, rode:

```powershell
cd C:\Users\draxs\Desktop\agendamento\backend
npm run check

cd C:\Users\draxs\Desktop\agendamento\frontend
npm run ci
```

Resultado esperado:

- Backend sem erros de lint.
- Frontend sem erros de lint.
- Build do Vite gerado com sucesso.
- Aviso de chunk grande pode aparecer; nao bloqueia login/cadastro.

### 1.2 Higiene do navegador

Para cada papel de usuario, prefira uma janela anonima nova.

Ao trocar de usuario no mesmo navegador:

1. Clique em `Sair`.
2. Abra DevTools.
3. Va em Application > Local Storage.
4. Remova `token` e `activeEstablishmentSlug`.
5. Recarregue a pagina.

### 1.3 Convencao para dados de teste

Nao use dados reais de clientes.

Use prefixos claros:

- Estabelecimento: `QA Studio <data-hora>`
- Profissional: `QA Profissional <data-hora>`
- Servico: `QA Servico <data-hora>`
- Plano: `QA Plano <data-hora>`
- Cliente: `QA Cliente <data-hora>`
- Email: `qa+<data-hora>@exemplo.com`

Depois do teste, remova ou desative o que foi criado.

### 1.4 Contas de referencia do seed demo

Use apenas se esses dados existirem no ambiente testado:

- Super Admin: `admin@agendamento.com` / `Admin@2024`
- Dono demo: `marina@streetlabsink.com` / `Street@2026`
- Cliente demo: `beatriz@streetlabsink.com` / `Cliente@2026`
- Cliente demo: `lucas@streetlabsink.com` / `Cliente@2026`
- Cliente demo: `amanda@streetlabsink.com` / `Cliente@2026`
- Slug demo: `streetlabs-ink`

## 2. Smoke test de producao

Execute primeiro. Se algum item falhar, pare e corrija antes de testar o resto.

### 2.1 Disponibilidade

1. Abra `/login`.
2. Abra `/cadastro`.
3. Abra `/super-admin/login`.
4. Abra `/<slug-demo>`.
5. Abra `/<slug-demo>/login`.
6. Abra `/<slug-demo>/cadastro`.
7. Abra `/<slug-demo>/agendar`.
8. Abra `/<slug-demo>/planos`.

Resultado esperado:

- Todas as paginas carregam.
- Nao ha tela branca.
- Nao ha erro 404/405 nas chamadas de API esperadas.
- Console do navegador nao mostra erro vermelho critico.

### 2.2 API

No terminal:

```powershell
Invoke-RestMethod https://agendamento-cvye.onrender.com/health
```

Resultado esperado:

- Resposta com `status = ok`.

Teste login invalido:

```powershell
Invoke-RestMethod `
  -Uri "https://agendamento-cvye.onrender.com/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"naoexiste@example.com","password":"senhaerrada"}'
```

Resultado esperado:

- HTTP 401.
- Mensagem de credenciais invalidas.
- Nunca retorna stack trace ou senha.

## 3. Landing page e rotas publicas

### 3.1 Landing principal

1. Abra `/`.
2. Valide logo, textos principais e CTAs.
3. Clique em `Entrar`.
4. Volte e clique em `Criar conta` ou `Comecar gratis`.
5. Teste em largura mobile.

Resultado esperado:

- Links levam para `/login` e `/cadastro`.
- Layout nao quebra em mobile.
- Nenhum texto fica sobreposto.

### 3.2 Pagina publica do estabelecimento

1. Abra `/<slug-demo>`.
2. Confirme nome, logo ou inicial, descricao e identidade visual.
3. Clique em `Agendar`.
4. Clique em `Planos`.
5. Clique em `Entrar`.

Resultado esperado:

- As rotas levam para `/<slug>/agendar`, `/<slug>/planos` e `/<slug>/login`.
- Cores e marca do estabelecimento aparecem corretamente.

### 3.3 Slug inexistente

1. Abra `/slug-que-nao-existe-qa`.

Resultado esperado:

- Sistema nao quebra.
- Exibe erro amigavel ou pagina de nao encontrado.
- Nao fica em loading infinito.

## 4. Autenticacao, cadastro e permissoes

### 4.1 Login do dono pelo acesso geral

1. Abra `/login`.
2. Entre com usuario dono.
3. Aguarde redirecionamento.

Resultado esperado:

- Login funciona.
- Usuario vai para `/<slug-do-estabelecimento>/admin`.
- `localStorage.token` existe.
- Sidebar/admin carrega dados do estabelecimento correto.

### 4.2 Login de cliente pelo acesso geral

1. Abra `/login`.
2. Tente entrar com cliente.

Resultado esperado:

- Acesso e bloqueado.
- Mensagem orienta entrar pela pagina do estabelecimento.
- Usuario nao entra em area administrativa.

### 4.3 Login de cliente pelo tenant

1. Abra `/<slug-demo>/login`.
2. Entre com cliente.

Resultado esperado:

- Login funciona.
- Usuario vai para `/<slug-demo>/cliente`.
- `activeEstablishmentSlug` fica salvo com o slug correto.

### 4.4 Login de dono pelo tenant correto

1. Abra `/<slug-demo>/login`.
2. Entre com dono daquele estabelecimento.

Resultado esperado:

- Login funciona.
- Usuario vai para `/<slug-demo>/admin`.

### 4.5 Login de dono pelo tenant errado

1. Crie ou use um segundo estabelecimento.
2. Abra `/outro-slug/login`.
3. Tente entrar com dono do primeiro estabelecimento.

Resultado esperado:

- Backend retorna 403.
- Frontend mostra mensagem de acesso negado.
- Usuario nao acessa dados do tenant errado.

### 4.6 Super Admin

1. Abra `/super-admin/login`.
2. Entre com Super Admin.
3. Confirme redirecionamento para `/super-admin`.
4. Saia.
5. Tente entrar com Super Admin em `/login`.

Resultado esperado:

- `/super-admin/login` funciona.
- `/login` nao deve ser o fluxo normal do Super Admin.
- Usuario e redirecionado/orientado ao painel restrito.

### 4.7 Cadastro de dono

1. Abra `/cadastro`.
2. Preencha nome do estabelecimento, nome do dono, email unico, telefone e senha.
3. Confirme senha.
4. Envie.

Resultado esperado:

- Cria usuario `establishment_admin`.
- Cria estabelecimento com slug automatico.
- Cria vinculo em `establishment_admins`.
- Redireciona para `/<novo-slug>/admin`.
- Dashboard admin carrega sem erro.

Casos negativos:

1. Email invalido.
2. Senha com menos de 6 caracteres.
3. Confirmacao diferente da senha.
4. Email ja usado.
5. Nome de estabelecimento vazio.

Resultado esperado:

- Formulario impede envio ou API retorna mensagem clara.
- Nao cria registros parciais.

### 4.8 Cadastro de cliente

1. Abra `/<slug-demo>/cadastro`.
2. Preencha nome, email unico, telefone e senha.
3. Envie.

Resultado esperado:

- Cria usuario `customer`.
- Cria perfil em `customers`.
- Redireciona para `/<slug-demo>/cliente` ou para a rota original em `state.from`.
- Cliente consegue agendar.

Casos negativos:

1. Email invalido.
2. Senha fraca/curta.
3. Confirmacao diferente.
4. Email ja usado.

### 4.9 Sessao expirada ou token invalido

1. Faça login.
2. Em Local Storage, altere o valor de `token` para `token-invalido`.
3. Recarregue uma rota protegida.

Resultado esperado:

- Sessao e removida.
- Usuario volta para login correto.
- Nao fica preso em tela de loading.

### 4.10 Rotas protegidas sem login

Acesse sem token:

- `/admin`
- `/<slug-demo>/admin`
- `/minha-conta`
- `/<slug-demo>/cliente`
- `/super-admin`

Resultado esperado:

- Admin tenant redireciona para login do tenant ou `/login`.
- Cliente redireciona para login do tenant.
- Super Admin redireciona para `/super-admin/login` ou bloqueia corretamente.
- Nao mostra dados antes de validar permissao.

### 4.11 Logout

1. Entre como dono.
2. Clique em `Sair`.
3. Volte no historico do navegador.

Resultado esperado:

- Token removido.
- Usuario nao acessa rota protegida.
- Retorna para tela de login.

## 5. Recuperacao e redefinicao de senha

### 5.1 Solicitar recuperacao

1. Abra `/recuperar-senha`.
2. Envie email existente.
3. Envie email inexistente.

Resultado esperado:

- Ambos exibem mensagem generica.
- Sistema nao revela se o email existe.
- Se SMTP estiver configurado, email chega com link.

### 5.2 Redefinir senha

1. Abra link recebido ou `/redefinir-senha?token=<token>`.
2. Informe nova senha.
3. Tente login com senha antiga.
4. Tente login com senha nova.

Resultado esperado:

- Senha antiga falha.
- Senha nova funciona.
- Token nao pode ser reutilizado.

### 5.3 Token invalido ou expirado

1. Abra `/redefinir-senha?token=token-invalido`.
2. Tente redefinir.

Resultado esperado:

- Mostra erro claro.
- Nao altera senha.

## 6. Fluxo publico de agendamento

### 6.1 Usuario deslogado tentando agendar

1. Abra `/<slug-demo>/agendar` sem login.

Resultado esperado:

- Mostra convite para entrar ou criar conta.
- Links preservam `state.from` para voltar ao agendamento apos login/cadastro.

### 6.2 Agendamento completo com cliente

1. Entre como cliente em `/<slug-demo>/login`.
2. Abra `/<slug-demo>/agendar`.
3. Escolha filial, se houver.
4. Escolha servico.
5. Escolha profissional ou "sem preferencia", se disponivel.
6. Escolha data.
7. Escolha horario.
8. Confirme.

Resultado esperado:

- Agendamento criado.
- Usuario vai para `/<slug-demo>/cliente`.
- Agendamento aparece para o cliente.
- Agendamento aparece no painel admin.
- Horario escolhido nao fica duplicado se houver regra de conflito.

### 6.3 Sem filiais

1. Teste com estabelecimento sem filial ativa.

Resultado esperado:

- Etapa de filial e pulada.
- Agendamento continua funcionando.

### 6.4 Sem servicos, profissionais ou horarios

Teste cada caso:

1. Estabelecimento sem servicos ativos.
2. Sem profissionais ativos.
3. Dia fechado.
4. Profissional sem horario disponivel.

Resultado esperado:

- Sistema mostra estado vazio amigavel.
- Nao permite confirmar agendamento incompleto.
- Nao gera erro 500.

### 6.5 Desconto/plano no agendamento

1. Entre com cliente que possui plano ativo.
2. Abra `/<slug>/agendar`.
3. Escolha servico coberto pelo plano.

Resultado esperado:

- Preco com desconto ou override aparece corretamente na confirmacao.
- Agendamento e criado com preco esperado.

## 7. Area do cliente

### 7.1 Dashboard do cliente

1. Entre como cliente.
2. Abra `/<slug>/cliente`.

Resultado esperado:

- Mostra saudacao.
- Mostra estabelecimento correto.
- Mostra proximos agendamentos.
- Mostra plano ativo ou convite para clube.

### 7.2 Meus agendamentos

1. Abra `/<slug>/cliente/agendamentos`.
2. Verifique lista de agendamentos.
3. Teste cancelar agendamento futuro, se a tela disponibilizar acao.
4. Teste reagendar, se a tela disponibilizar acao.

Resultado esperado:

- Lista filtra pelo estabelecimento correto.
- Cancelamento muda status para `cancelled`.
- Reagendamento altera data/hora e respeita disponibilidade.

### 7.3 Perfil do cliente

1. Abra `/<slug>/cliente/perfil`.
2. Atualize telefone, nascimento, CPF, genero, endereco e outros campos disponiveis.
3. Salve.
4. Recarregue a pagina.

Resultado esperado:

- Dados persistem.
- Campos vazios opcionais viram nulos quando adequado.
- Email/nome seguem consistentes.

### 7.4 Clube e plano do cliente

1. Abra `/<slug>/cliente/clube`.
2. Abra `/<slug>/cliente/plano`.
3. Se houver plano ativo, confira beneficios.
4. Se nao houver, tente contratar plano.

Resultado esperado:

- Planos exibem valores corretos.
- Assinatura leva ao checkout Asaas quando configurado.
- Se Asaas nao estiver configurado, mostra erro amigavel.
- Plano ativo aparece no dashboard e na area de plano.

## 8. Painel admin do estabelecimento

### 8.1 Dashboard admin

1. Entre como dono.
2. Abra `/<slug>/admin`.

Resultado esperado:

- Cards, metricas e graficos carregam.
- Dados pertencem somente ao estabelecimento do dono.
- Nao ha chamadas 403/500 inesperadas.

### 8.2 Agendamentos admin

1. Abra `/<slug>/admin/agendamentos`.
2. Filtre por status.
3. Filtre por data.
4. Marque um agendamento como `Compareceu`.
5. Marque outro como `Faltou`.
6. Use menu de outras acoes para `Confirmar` e `Cancelar`.

Resultado esperado:

- Status atualiza.
- Toast confirma a acao.
- Lista recarrega.
- Filtros continuam coerentes.
- Agendamento finalizado nao mostra acoes indevidas.

### 8.3 Profissionais

1. Abra `/<slug>/admin/profissionais`.
2. Crie profissional.
3. Edite nome/bio/status.
4. Faça upload de avatar, se disponivel.
5. Vincule servicos.
6. Remova servico vinculado.
7. Exclua ou desative profissional de teste.

Resultado esperado:

- Profissional aparece em lista admin.
- Profissional ativo aparece no fluxo publico.
- Profissional inativo nao deve aparecer no fluxo publico.
- Vinculos com servicos alteram filtro no agendamento.

### 8.4 Servicos

1. Abra `/<slug>/admin/servicos`.
2. Crie servico com nome, descricao, duracao e preco.
3. Edite preco e duracao.
4. Desative ou exclua servico.

Resultado esperado:

- Servico ativo aparece em `/<slug>/agendar`.
- Servico inativo/excluido nao aparece no publico.
- Duracao influencia horarios disponiveis.
- Preco aparece corretamente.

### 8.5 Clientes admin

1. Abra `/<slug>/admin/clientes`.
2. Pesquise cliente.
3. Verifique origem: agendamento, assinatura ou ambos.
4. Confira dados de contato e assinatura.

Resultado esperado:

- Lista mostra apenas clientes do estabelecimento.
- Busca funciona.
- Dados sensiveis nao vazam indevidamente.

### 8.6 Clube / Planos admin

1. Abra `/<slug>/admin/clube`.
2. Crie plano com nome, descricao, preco, intervalo, limite e desconto.
3. Edite plano.
4. Ative/desative ou exclua plano.
5. Vincule servicos ao plano.
6. Defina preco especial por servico.
7. Abra `/<slug>/planos` como publico/cliente.

Resultado esperado:

- Plano ativo aparece na pagina publica de planos.
- Plano inativo nao aparece.
- Servicos vinculados aparecem com desconto/override.
- Assinantes aparecem na lista admin.

### 8.7 Assinaturas admin

1. No admin de planos, abra lista de assinantes.
2. Ative uma assinatura pendente.
3. Cancele uma assinatura ativa.
4. Gere checkout para assinatura, se disponivel.

Resultado esperado:

- Status muda corretamente.
- Cliente ve status atualizado.
- Checkout abre URL externa quando configurado.
- Erros de Asaas sao claros.

### 8.8 Filiais

1. Abra `/<slug>/admin/filiais`.
2. Crie filial com nome, endereco, cidade, estado, CEP e telefone.
3. Edite dados.
4. Desative ou exclua filial.
5. Abra `/<slug>/agendar`.

Resultado esperado:

- Filial ativa aparece como primeira etapa do agendamento.
- Filial inativa/excluida nao aparece.
- Agendamento salva `branchId` correto.

### 8.9 Financeiro

1. Abra `/<slug>/admin/financeiro`.
2. Teste filtros de periodo.
3. Verifique resumo.
4. Verifique receita por dia.
5. Verifique receita por filial.
6. Verifique receita por profissional.
7. Verifique receita por servico.
8. Abra transacoes.
9. Altere metodo de pagamento de um agendamento.

Resultado esperado:

- Valores batem com agendamentos concluidos e assinaturas.
- Graficos/tabelas nao quebram sem dados.
- Metodo de pagamento persiste apos reload.

### 8.10 Personalizacao - portfolio

1. Abra `/<slug>/admin/personalizar/portfolio`.
2. Edite tagline, sobre, destaques e redes sociais.
3. Faça upload/adicao de imagem de galeria, se disponivel.
4. Salve.
5. Abra `/<slug>`.

Resultado esperado:

- Pagina publica reflete as alteracoes.
- URLs validas funcionam.
- Imagens aparecem.
- Campos vazios nao quebram layout.

### 8.11 Personalizacao - tela do cliente

1. Abra `/<slug>/admin/personalizar/tela-cliente`.
2. Altere cor principal, cor de destaque, titulo/subtitulo de agendamento ou campos disponiveis.
3. Salve.
4. Abra `/<slug>/login`, `/<slug>/cadastro`, `/<slug>/agendar` e `/<slug>/cliente`.

Resultado esperado:

- Identidade visual e textos atualizam.
- Contraste continua legivel.
- Mobile nao quebra.

### 8.12 Configuracoes - horarios

1. Abra `/<slug>/admin/configuracoes`.
2. Marque/desmarque dias abertos.
3. Altere hora inicial e final.
4. Salve.
5. Abra `/<slug>/agendar`.

Resultado esperado:

- Dias fechados nao oferecem horarios.
- Horarios fora do expediente nao aparecem.
- Erro e mostrado se horario final for anterior ao inicial.

### 8.13 Configuracoes - Asaas

Execute somente em sandbox ou ambiente autorizado.

1. Abra `/<slug>/admin/configuracoes`.
2. Verifique status da integracao Asaas.
3. Se nao configurado, preencha formulario de subconta com dados de teste.
4. Crie subconta.
5. Clique em sincronizar.

Resultado esperado:

- Se backend nao tiver `ASAAS_API_KEY`, mostra aviso claro.
- Se configurado, subconta e criada/sincronizada.
- Chave de API aparece mascarada.
- Onboarding pendente aparece com links quando houver.

## 9. Super Admin

### 9.1 Dashboard

1. Entre em `/super-admin/login`.
2. Abra `/super-admin`.

Resultado esperado:

- Dashboard carrega contadores e dados globais.
- Nao mostra erro de permissao.

### 9.2 Estabelecimentos

1. Abra `/super-admin/estabelecimentos`.
2. Pesquise/lista estabelecimentos.
3. Crie estabelecimento.
4. Edite estabelecimento.
5. Altere status para ativo/inativo/suspenso, se disponivel.
6. Abra detalhe do estabelecimento.

Resultado esperado:

- Slug unico e validado.
- Slugs reservados como `login`, `admin`, `api` sao bloqueados.
- Estabelecimento inativo/suspenso nao permite login do dono nem acesso publico normal.

### 9.3 Detalhe do estabelecimento

1. Abra detalhe de um estabelecimento.
2. Confira dados, administradores, URL publica e login.
3. Copie/abra URL publica.
4. Crie administrador para esse estabelecimento, se disponivel.

Resultado esperado:

- URL leva ao tenant correto.
- Novo admin consegue entrar no tenant.
- Admin nao acessa outro tenant.

### 9.4 Usuarios

1. Abra `/super-admin/usuarios`.
2. Filtre por papel.
3. Pesquise usuario.
4. Crie usuario administrador.
5. Ative/desative usuario.

Resultado esperado:

- Usuario desativado nao consegue login.
- Usuario reativado consegue login.
- Filtros e contadores atualizam.

### 9.5 Asaas pelo Super Admin

Se a tela permitir gerenciar subconta Asaas do estabelecimento:

1. Abra detalhe do estabelecimento.
2. Verifique status da subconta.
3. Crie/sincronize subconta em sandbox.

Resultado esperado:

- Status bate com painel financeiro do estabelecimento.
- Dados sensiveis aparecem mascarados.

## 10. Testes de isolamento multi-tenant

Crie ou use dois tenants: `tenant-a` e `tenant-b`.

### 10.1 Dono nao acessa outro tenant

1. Entre como dono do `tenant-a`.
2. Tente abrir `/tenant-b/admin`.
3. Tente chamar API de recursos do `tenant-b`.

Resultado esperado:

- Frontend redireciona para `/tenant-a/admin`.
- Backend retorna 403 para dados de outro tenant.

### 10.2 Dados separados

1. Crie servico no `tenant-a`.
2. Abra agenda publica do `tenant-b`.
3. Crie profissional no `tenant-b`.
4. Abra admin do `tenant-a`.

Resultado esperado:

- Servicos/profissionais nao cruzam entre tenants.
- Clientes e agendamentos tambem nao cruzam.

### 10.3 Cliente em multiplos estabelecimentos

1. Cliente agenda no `tenant-a`.
2. Mesmo cliente agenda no `tenant-b`.
3. Abra `/minha-conta`.

Resultado esperado:

- Sistema escolhe estabelecimento ativo ou lista primeiro estabelecimento disponivel.
- `activeEstablishmentSlug` nao envia cliente para tenant errado.

## 11. Testes negativos e seguranca basica

### 11.1 Validacoes comuns

Teste em formularios:

- Campos obrigatorios vazios.
- Email invalido.
- Preco negativo.
- Duracao zero.
- Horario final antes do inicial.
- Slug com espaco, acento ou caractere especial.
- Upload de arquivo que nao seja imagem.
- Upload de imagem maior que limite.

Resultado esperado:

- Mensagem clara.
- Nenhum 500.
- Nenhum registro parcial inconsistente.

### 11.2 Permissoes por papel

Sem token ou com papel errado, tente acessar APIs:

- Cliente chamando `/plans` admin.
- Cliente chamando `/financial/summary`.
- Dono chamando `/super-admin/users`.
- Super Admin chamando rota de tenant sem contexto quando nao permitido.

Resultado esperado:

- 401 quando nao autenticado.
- 403 quando papel nao permite.
- Nao retorna dados sensiveis.

### 11.3 CORS e API errada

1. Abra DevTools > Network.
2. Faça login.
3. Confira URL das chamadas.

Resultado esperado:

- Frontend chama o backend correto.
- Nao deve chamar `/api/v1` do proprio Vercel se nao houver proxy configurado.
- Nao deve aparecer 405 em `/auth/login`.

### 11.4 Erros de servidor

Force entradas invalidas e confira respostas.

Resultado esperado:

- Em producao, erro 500 retorna mensagem generica.
- Nao vaza stack trace, chaves, SQL ou service role key.

## 12. Testes responsivos e navegadores

Testar em:

- Desktop 1366x768.
- Desktop grande 1920x1080.
- Mobile 390x844.
- Tablet 768x1024.

Fluxos obrigatorios em mobile:

1. Login.
2. Cadastro.
3. Agendamento.
4. Area do cliente.
5. Admin com menu lateral mobile.
6. Tabelas/listas de agendamentos, clientes e financeiro.

Resultado esperado:

- Nao ha texto cortado.
- Botoes sao clicaveis.
- Menus abrem/fecham.
- Tabelas nao estouram a tela de forma inutilizavel.

## 13. Testes de regressao apos deploy

Depois de publicar backend e frontend:

1. Limpe cache ou abra aba anonima.
2. Rode smoke test da secao 2.
3. Teste login de dono.
4. Teste login de cliente pelo tenant.
5. Teste bloqueio de cliente no `/login` geral.
6. Crie um agendamento.
7. Marque agendamento como compareceu no admin.
8. Confira financeiro.
9. Crie um cadastro de dono com email QA.
10. Crie um cadastro de cliente com email QA.
11. Exclua/desative dados QA.

Resultado esperado:

- Tudo passa sem 401/403 indevido.
- Nenhum 405 em login/cadastro.
- Dados novos aparecem nos paineis corretos.

## 14. Evidencias para registrar

Para cada rodada, salve:

- Data e hora do teste.
- URL do ambiente.
- Commit/versao publicada.
- Usuario usado.
- Browser e dispositivo.
- Prints de falhas.
- Erros do console.
- Erros do Network.
- Payload/response sem dados sensiveis.
- Passou/falhou por modulo.

Modelo simples:

```text
Data:
Ambiente:
Commit:
Tester:
Browser:

Smoke: PASS/FAIL
Login/Cadastro: PASS/FAIL
Publico/Agendamento: PASS/FAIL
Cliente: PASS/FAIL
Admin: PASS/FAIL
Super Admin: PASS/FAIL
Financeiro/Asaas: PASS/FAIL
Mobile: PASS/FAIL

Falhas encontradas:
1.
2.
3.

Reteste:
1.
2.
```

## 15. Criterio de aceite para publicar

Pode publicar quando:

- `npm run check` passa no backend.
- `npm run ci` passa no frontend.
- Smoke test passa em producao ou staging.
- Login/cadastro dos tres papeis passa.
- Cliente nao entra pelo `/login` geral.
- Dono nao acessa tenant errado.
- Agendamento completo funciona.
- Admin visualiza e altera status do agendamento.
- Financeiro carrega sem erro.
- Super Admin consegue listar usuarios e estabelecimentos.
- Nao ha erro 500/405 nos fluxos principais.
- Dados de teste foram limpos ou claramente marcados.

