import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import styles from '../styles/CreatePost.module.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !adminToken.trim()) {
      setError('Title, content, and admin token are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setAdminToken('');
        router.push('/');
      } else if (res.status === 403) {
        setError('Forbidden: Invalid admin token.');
      } else {
        const json = await res.json();
        setError(json.error || 'Failed to create the post.');
      }
    } catch (err) {
      setError('An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Create a New Post</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              required
              placeholder="Write your post here..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="adminToken" className={styles.label}>Admin Token:</label>
            <input
              type="password"
              id="adminToken"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className={styles.input}
              required
              placeholder="Enter admin token"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Create Post'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;
