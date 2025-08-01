import Image from "next/image";
import styles from "./page.module.css";
import BackgroundBubbles from "./components/ui/backgroundBubles";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.container}>
      <BackgroundBubbles />
        <section className={styles.hero}>
          <h1>Automatize seus contatos no WhatsApp com inteligência</h1>
          <p>
            Pare de perder tempo com follow-ups manuais. Crie fluxos automáticos e monitore quem te responde.
          </p>
          <div className={styles.buttons}>
            <a href="/Form" className={styles.btn}>Quero automatizar</a>
            <a href="/simulacao" className={styles.btnOutline}>Ver simulação</a>
          </div>
        </section>
      </main>
    </div>
  );
}