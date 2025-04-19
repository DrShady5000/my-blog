import { MongoClient, ObjectId } from 'mongodb';
import { GetStaticProps, GetStaticPaths } from 'next';

const MONGODB_URI = process.env.MONGODB_URI!;  // Ensure this is defined

interface Post {
  _id: string | ObjectId;  // MongoDB's default _id field, can be a string or ObjectId
  title: string;
  content: string | string[];  // content can be a string or an array of strings
  date: string;
  image?: string;
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const { id } = params;

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
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { notFound: true };
  }
}

export async function getStaticPaths() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const postsCollection = db.collection('posts');

    const posts = await postsCollection.find({}).toArray();

    client.close();

    const paths = posts.map((post: Post) => ({
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
}

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
  if (!post) {
    return (
      <div style={styles.notFound}>
        <h1>Post not found</h1>
        <p>The post you’re looking for doesn’t exist.</p>
      </div>
    );
  }

  const [day, month, year] = post.date.split('/');
  const formattedDate = new Date(`${year}-${month}-${day}`).toLocaleDateString('en-NZ');

  const contentString = Array.isArray(post.content) ? post.content.join('\n') : post.content;

  const contentParagraphs = contentString.split('\n').map((paragraph, index) => (
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
          <img
            src={post.image}
            alt={post.title}
            style={styles.image}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => window.history.back()}
          style={styles.button}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PostPage;
