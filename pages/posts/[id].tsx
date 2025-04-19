import { MongoClient, ObjectId } from 'mongodb';
import { GetStaticProps, GetStaticPaths } from 'next';

const MONGODB_URI = process.env.MONGODB_URI!;
interface Post {
  _id: string | ObjectId;
  title: string;
  content: string | string[];
  date: string;
  image?: string;
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const { id } = params;

  // Log the received ID for debugging purposes
  console.log('Received ID:', id);

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const postsCollection = db.collection('posts');

    // Query for the post using MongoDB's default `_id`
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    console.log('Post fetched: ', post);

    client.close();

    // If no post is found, return a 404 page
    if (!post) {
      console.log('No post found for ID:', id);
      return {
        notFound: true, 
      };
    }

    // Return the post data to be used in the page component
    return {
      props: { post: JSON.parse(JSON.stringify(post)) }, // Convert ObjectId and any non-serializable data
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { notFound: true };
  }
}

export async function getStaticPaths() {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const postsCollection = db.collection('posts');

    const posts = await postsCollection.find({}).toArray();
    console.log('Posts fetched for paths:', posts);

    // Generate paths based on the MongoDB _id field
    const paths = posts.map((post: Post) => ({
      params: { id: post._id.toString() },  // Convert ObjectId to string
    }));

    client.close();

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { paths: [], fallback: true };
  }
}

const PostPage = ({ post }: { post: Post | null }) => {
  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Post not found</h1>
        <p>The post you’re looking for doesn’t exist.</p>
      </div>
    );
  }

  // Format date from dd/mm/yyyy to NZ date format
  const [day, month, year] = post.date.split('/');
  const formattedDate = new Date(`${year}-${month}-${day}`).toLocaleDateString('en-NZ');

  const contentString = Array.isArray(post.content) ? post.content.join('\n') : post.content;

  // Split content into paragraphs
  const contentParagraphs = contentString.split('\n').map((paragraph, index) => (
    <p key={index}>{paragraph}</p>
  ));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1>{post.title}</h1>
      <p><strong>Date:</strong> {formattedDate}</p>

      <div style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        {contentParagraphs}
      </div>

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
          onClick={() => window.history.back()}
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
    </div>
  );
};

export default PostPage;
