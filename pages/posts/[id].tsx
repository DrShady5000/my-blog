import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import fs from 'fs';
import path from 'path';

interface Post {
  id: number | string;
  title: string;
  content: string;
  date: string;
  image?: string;
}

const PostPage = ({ post }: { post: Post | null }) => {
  const router = useRouter();

  // Fallback loading state for statically generated pages
  if (router.isFallback) return <div>Loading...</div>;

  // Handle case where post is not found
  if (!post) {
    return (
      <Layout>
        <h1>Post not found</h1>
        <p>The post you’re looking for doesn’t exist.</p>
      </Layout>
    );
  }

  // Format date from dd/mm/yyyy to localized display
  const [day, month, year] = post.date.split('/');
  const formattedDate = new Date(`${year}-${month}-${day}`).toLocaleDateString('en-NZ');

  return (
    <Layout>
      <h1>{post.title}</h1>
      <p><strong>Date:</strong> {formattedDate}</p>
      <p>{post.content}</p>

      {post.image && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '10px',
            }}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Back to Home
        </button>
      </div>
    </Layout>
  );
};

// Pre-generates paths for all posts (SSG with dynamic routes)
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'data', 'posts.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const posts: Post[] = JSON.parse(fileContent);

  const paths = posts.map(post => ({
    params: { id: String(post.id) },
  }));

  return {
    paths,
    fallback: true, // Enables fallback rendering for new posts
  };
}

// Fetches the post data at build time based on the post ID
export async function getStaticProps({ params }: { params: { id: string } }) {
  const filePath = path.join(process.cwd(), 'data', 'posts.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const posts: Post[] = JSON.parse(fileContent);

  const post = posts.find(p => String(p.id) === params.id) || null;

  return {
    props: { post },
  };
}

export default PostPage;
