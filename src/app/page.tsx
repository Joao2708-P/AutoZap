import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.brand}>
            <span className={styles.brandDot} aria-hidden />
            <span>AutoZap</span>
          </a>

          <nav className={styles.nav}>
            <a href="#features">Recursos</a>
            <a href="#demo">Simulação</a>
            <a href="#pricing">Preços</a>
            <a href="/login" className={styles.login}>Entrar</a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.badge}>Novo • versão preview</div>
          <h1>Automatize seus contatos no WhatsApp com inteligência</h1>
          <p>
            Pare de perder tempo com follow-ups manuais. Crie fluxos automáticos, responda
            mais rápido e monitore quem te responde em um só lugar.
          </p>
          <div className={styles.buttons}>
            <a href="/Form" className={styles.btnPrimary}>Quero automatizar</a>
            <a href="/simulacao" className={styles.btnGhost}>Ver simulação</a>
          </div>

          <div className={styles.quickRow}>
            <div className={styles.quickItem}>
              <span className={styles.qIcon} aria-hidden>⚡</span>
              Disparos programados
            </div>
            <div className={styles.quickItem}>
              <span className={styles.qIcon} aria-hidden>🤖</span>
              Fluxos sem código
            </div>
            <div className={styles.quickItem}>
              <span className={styles.qIcon} aria-hidden>📊</span>
              Métricas em tempo real
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className={styles.features}>
          <div className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>🧩</div>
              <h3>Construtor de Fluxo</h3>
              <p>Monte jornadas visuais de mensagens: condições, atrasos e ramificações com cliques.</p>
              <div className={styles.flowMock}>
                <div className={styles.node}>Início</div>
                <div className={styles.arrow} />
                <div className={styles.node}>Mensagem 1</div>
                <div className={styles.arrow} />
                <div className={styles.nodeAlt}>Se respondeu ➜ Mensagem 2</div>
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>⏱️</div>
              <h3>Disparos & Regras</h3>
              <p>Agende, segmente e reenvie automaticamente para quem não visualizou.</p>
              <ul className={styles.bullets}>
                <li>Envio em lote com janelas de tempo</li>
                <li>Regras por tag/etapa do funil</li>
                <li>Fallback inteligente</li>
              </ul>
            </article>

            <article className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>📈</div>
              <h3>Métricas</h3>
              <p>Acompanhe entregas, respostas e conversões por campanha e por operador.</p>
              <div className={styles.miniChart}>
                <div style={{height:"70%"}} />
                <div style={{height:"52%"}} />
                <div style={{height:"85%"}} />
                <div style={{height:"61%"}} />
                <div style={{height:"92%"}} />
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>🔗</div>
              <h3>API Oficial</h3>
              <p>Integração com a Cloud API da Meta: estável, segura e escalável.</p>
              <code className={styles.code}>
{`POST /messages
{ to: "+55XXXXXXXXXXX", template: "follow_up_1" }`}
              </code>
            </article>
          </div>
        </section>

        {/* DEMO */}
        <section id="demo" className={styles.demo}>
          <div className={styles.demoCard}>
            <div className={styles.phoneTop} />
            <div className={styles.chat}>
              <div className={`${styles.bubble} ${styles.bubbleOut}`}>Olá! Posso te ajudar?</div>
              <div className={`${styles.bubble} ${styles.bubbleIn}`}>Quero saber mais do plano.</div>
              <div className={`${styles.bubble} ${styles.bubbleOut}`}>Perfeito! Te envio os detalhes agora 👇</div>
            </div>
          </div>

          <div className={styles.demoCopy}>
            <h3>Veja a automação acontecendo</h3>
            <p>
              Simule envios, condições e respostas. Ajuste o fluxo e publique em segundos.
            </p>
            <a href="/simulacao" className={styles.btnPrimary}>Abrir simulação</a>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="pricing" className={styles.cta}>
          <h3>Pronto para automatizar seus contatos no WhatsApp?</h3>
          <p>Comece agora e ganhe horas por semana com follow-ups automáticos.</p>
          <a href="/Form" className={styles.btnPrimary}>Começar agora</a>
        </section>
      </main>

      {/* Rodapé */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} AutoZap</span>
          <nav className={styles.footerNav}>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
            <a href="#features">Recursos</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
