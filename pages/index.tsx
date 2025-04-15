import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getPosts } from '../lib/posts';

interface Post {
  id: number;
  title: string;
  content: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getPosts();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <h1>Welcome to My Blog!</h1>
      <p>This is where I document my journey in full-stack development, my projects, and my weight loss progress.</p>

      {/* Create Post Button */}
      <div style={{ margin: '20px 0' }}>
        <Link href="/create-post">
          <button style={{ padding: '10px 20px', background: '#64b5f6', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Create New Post
          </button>
        </Link>
      </div>

      {/* List of Posts */}
      <div>
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: '20px' }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
