import { MongoClient, ObjectId } from 'mongodb';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../../styles/PostPage.module.css';

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

const PostPage = ({ post }: { post: Post | null }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.notFound}>
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
    <div className={styles.container}>
      <h1>{post.title}</h1>
      <p className={styles.date}><strong>Date:</strong> {formattedDate}</p>

      <div className={styles.contentWrapper}>
        {contentParagraphs}
      </div>

      {post.image && (
        <div className={styles.imageContainer}>
          <Image
            src={post.image}
            alt={post.title}
            layout="responsive"
            width={800}
            height={600}
            className={styles.image}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.history.back()} className={styles.button}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PostPage;
