import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const Post = () => {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <Layout>
      <h1>{slug}</h1>
      <p>This is a dynamic page for the blog post: {slug}</p>
    </Layout>
  );
};

export default Post;
