import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';

interface Post {
  id: number | string;
  title: string;
  content: string;
  date: string; 
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch posts, status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          // Sort posts by date in descending order (newest first)
          const sortedPosts = data.sort((a: Post, b: Post) => {
            const dateA = new Date(a.date); 
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();  
          });

          setPosts(sortedPosts);
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
        <h1>Welcome to Sahil's Blog</h1>
        <h1>About Me</h1>
        <p>
          I’m Sahil Deo, a full-stack developer. I specialize in React, Node.js, and cloud technologies. 
          This blog is where I document my full-stack journey, my projects, and just general thoughts about my life.
        </p>
        <h2>Posts</h2>

        {error && <p className={styles.error}>{error}</p>}

        <ul className={styles.postList}> 
          {posts.map((post) => (
            <li key={post.id} className={styles.postItem}>
              <Link href={`/posts/${post.id}`}>
                <h3 className={styles.postTitle}>{post.title}</h3>
              </Link>
              <p>{post.content}</p>
              <p><strong>Posted on:</strong> {post.date}</p>
            </li>
          ))}
        </ul>

        <Link href="/create-post">
          <button className={styles.createPostButton}>Create New Post</button>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;
