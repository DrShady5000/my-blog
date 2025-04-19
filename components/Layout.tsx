import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/Layout.module.css';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

// Reusable layout wrapper for pages (adds header, footer, and styling)
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Head>
        <title>Sahil&apos;s Blog</title>
        <meta name="description" content="Sahil&apos;s full-stack blog" />
      </Head>

      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/all-posts" className={styles.link}>All Posts</Link>
        </nav>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Sahil Deo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
