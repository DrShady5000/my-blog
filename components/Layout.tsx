import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/Layout.module.css'; // Import the CSS module
import { ReactNode } from 'react'; // Import ReactNode to type children

interface LayoutProps {
  children: ReactNode; // Explicitly type children as ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Head>
        <title>Sahil's Blog</title>
        <meta name="description" content="Sahil's full-stack blog" />
      </Head>
      
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/about" className={styles.link}>About</Link>
        </nav>
      </header>

      <main className={styles.main}>
        {children} {/* Render the children here */}
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Sahil Deo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
