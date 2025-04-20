import { MongoClient, ObjectId } from 'mongodb';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';  // Import Next.js Image component

const MONGODB_URI = process.env.MONGODB_URI!;

interface Post {
  _id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const postsCollection = db.collection('posts');

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    client.close();

    if (!post) {
      return { notFound: true };
    }

    return {
      props: { post: JSON.parse(JSON.stringify(post)) },
      revalidate: 10,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const postsCollection = db.collection('posts');

    const posts = await postsCollection.find({}).toArray();

    client.close();

    const paths = posts.map((post) => ({
      params: { id: post._id.toString() },
    }));

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { paths: [], fallback: true };
  }
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
  },
  contentWrapper: {
    maxWidth: '800px',
    marginBottom: '2rem',
  },
  imageContainer: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '10px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  date: {
    marginTop: '1rem',
  },
  notFound: {
    textAlign: 'center',
    padding: '50px',
  },
};

const PostPage = ({ post }: { post: Post | null }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={styles.notFound}>
        <h1>Post not found</h1>
        <p>The post you’re looking for doesn’t exist.</p>
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-NZ');
  const contentParagraphs = post.content.split('\n').map((paragraph, index) => (
    <p key={index}>{paragraph}</p>
  ));

  return (
    <div style={styles.container}>
      <h1>{post.title}</h1>
      <p style={styles.date}><strong>Date:</strong> {formattedDate}</p>

      <div style={styles.contentWrapper}>
        {contentParagraphs}
      </div>

      {post.image && (
        <div style={styles.imageContainer}>
          <Image
            src={post.image}
            alt={post.title}
            layout="responsive" // Adjusts layout for responsive sizing
            width={800}         // Adjust width (can also use intrinsic for auto size)
            height={600}        // Adjust height
            style={styles.image}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.history.back()} style={styles.button}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PostPage;
