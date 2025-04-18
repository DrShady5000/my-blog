import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';

interface Post {
  id: number | string;
  title: string;
  content: string[];
  date: string;
}

// Function to parse date from dd/mm/yyyy format
const parseDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
};

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const postsPerPage = 3; // Number of posts to display on the homepage

  useEffect(() => {
    // Fetching posts from the API
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) throw new Error(`Failed to fetch posts, status: ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data)) {
          // Sorting posts by date (newest first)
          const sortedPosts = data.sort((a: Post, b: Post) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB.getTime() - dateA.getTime();
          });

          // Setting posts to state, limiting to postsPerPage
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
        <h1>All Posts</h1>

        {error && <p className={styles.error}>{error}</p>}

        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post.id} className={styles.postItem}>
              <Link href={`/posts/${post.id}`}>
                <h3 className={styles.postTitle}>{post.title}</h3>
              </Link>
              <p>{post.content[0].substring(0, 150)}...</p>
              <Link href={`/posts/${post.id}`} className="readMoreLink">
                Read more
              </Link>
              <p><strong>Posted on:</strong> {parseDate(post.date).toLocaleDateString('en-NZ')}</p>
            </li>
          ))}
        </ul>

        <div className={styles.buttons}>
          <Link href="/">
            <button className={styles.createPostButton}>Back to home</button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AllPosts;
