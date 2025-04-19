import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import styles from '../styles/CreatePost.module.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    const contentString = content.split('\n').join('\n');

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', contentString); // Send content as a single string
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // Clear form after successful submission
        setTitle('');
        setContent('');
        setImage(null);

        router.push('/'); // Redirect to homepage on success
      } else {
        throw new Error('Failed to create the post.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        setError('File size must be less than 5MB.');
        return;
      }
      setImage(file);
      setError('');
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
            <label htmlFor="image" className={styles.label}>Image (optional):</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.input}
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
