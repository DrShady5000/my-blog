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

// Function to parse date format 'DD/MM/YYYY'
const parseDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
};

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const postsPerPage = 3; // Limit posts per page on the homepage

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');  // Fetch posts from API
        if (!response.ok) {
          throw new Error(`Failed to fetch posts, status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          // Sort posts by date in descending order (newest first)
          const sortedPosts = data.sort((a: Post, b: Post) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB.getTime() - dateA.getTime();  // Compare timestamps
          });

          // Set only the limited number of posts for the homepage
          setPosts(sortedPosts.slice(0, postsPerPage));
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();  // Call fetchPosts when the component mounts
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

        {error && <p className={styles.error}>{error}</p>}  {/* Display error message if there's an issue fetching posts */}

        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post.id} className={styles.postItem}>
              <Link href={`/posts/${post.id}`}>
                <h3 className={styles.postTitle}>{post.title}</h3>
              </Link>
              <p>{post.content[0].substring(0, 150)}...</p> {/* Show a snippet of the post content */}
              <Link href={`/posts/${post.id}`} className="readMoreLink">
                Read more
              </Link>
              <p><strong>Posted on:</strong> {parseDate(post.date).toLocaleDateString('en-NZ')}</p> {/* Display the post date */}
            </li>
          ))}
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
