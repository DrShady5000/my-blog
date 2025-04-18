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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for required fields
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }

    setIsLoading(true);
    setError(''); // Clear previous errors before submitting

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/'); // Redirect to homepage on success
      } else {
        throw new Error('Failed to create the post.');
      }
    } catch (err) { 
      if (err instanceof Error) {
        setError(err.message); // Access 'message' if it's an instance of Error
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];

      // Validate file size
      if (file) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
        if (file.size > MAX_SIZE) {
          setError('File size must be less than 5MB.');
          return;
        }

        setImage(file);
        setError(''); // Clear error if file is valid
      }
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Create a New Post</h1>
        {error && <p className={styles.error}>{error}</p>} {/* Show error message */}
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
