import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';

interface Post {
  _id: string;
  title: string;
  content: string;
  date: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const postsPerPage = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error(`Failed to fetch posts, status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const sortedPosts = data.sort((a: Post, b: Post) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setPosts(sortedPosts.slice(0, postsPerPage));
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className={styles.centerText}>
        <h1>Welcome to Sahil&apos;s Blog</h1>
        <h1>About Me</h1>
        <p>
          I&apos;m Sahil Deo, a full-stack developer. I specialize in React, Node.js, and cloud technologies.
        </p>
        <p>
          This blog is where I document my full-stack journey, my projects, and just general thoughts about my life.
        </p>

        <h2>Posts</h2>
        {error && <p className={styles.error}>{error}</p>}

        <ul className={styles.postList}>
          {posts.map((post) => {
            const snippet = post.content.length > 150
              ? post.content.slice(0, 150) + '...'
              : post.content;

            return (
              <li key={post._id} className={styles.postItem}>
                <Link href={`/posts/${post._id}`} passHref>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                </Link>
                <p>{snippet}</p>
                <Link href={`/posts/${post._id}`} className="readMoreLink">
                  Read more
                </Link>
                <p><strong>Posted on:</strong> {new Date(post.date).toLocaleDateString('en-NZ')}</p>
              </li>
            );
          })}
        </ul>

        <div className={styles.buttons}>
          <Link href="/create-post">
            <button className={styles.createPostButton}>Create New Post</button>
          </Link>
          <Link href="/all-posts">
            <button className={styles.createPostButton}>See All Posts</button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
