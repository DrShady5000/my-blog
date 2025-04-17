// pages/api/posts.ts

import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');
const imagesDir = path.join(process.cwd(), 'public', 'images');

// Helper function to read posts
const readPosts = () => {
  const fileContent = fs.readFileSync(postsFilePath, 'utf-8');
  return JSON.parse(fileContent);
};

// Helper function to write posts
const writePosts = (posts: any[]) => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
};

// Ensure the images directory exists
const ensureImagesDirExists = () => {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};

// API handler
export const config = {
  api: {
    bodyParser: false,  // Disable default body parsing to use formidable
  },
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    // Handle POST request (creating a new post)
    ensureImagesDirExists();

    const form = new IncomingForm();
    form.uploadDir = imagesDir; // Directory to save images
    form.keepExtensions = true;  // Keep the original file extension

    // Validate image type and size (optional)
    form.on('fileBegin', (name, file) => {
      if (file) {
        console.log('File received:', file); // Log the file object for debugging

        // Explicitly check for the mime type of the file
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
          console.error('Invalid file type:', file.mimetype); // More detailed error logging
          return res.status(400).json({ error: 'Only image files are allowed.' });
        }

        // Optional: limit file size to 5MB (adjust size limit as needed)
        const MAX_SIZE = 5 * 1024 * 1024;  // 5MB
        console.log('File size:', file.size); // Log the size for debugging
        if (file.size > MAX_SIZE) {
          console.error('File size exceeds limit:', file.size); // More detailed error logging
          return res.status(400).json({ error: 'File size must be less than 5MB.' });
        }
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err); // Log parsing errors
        return res.status(500).json({ error: 'Failed to parse the form' });
      }

      const { title, content } = fields;
      const image = files.image ? `/images/${files.image[0].newFilename}` : null; // Path to the uploaded image

      // Check if title and content are present
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }

      const newPost = {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString(),
        image,
      };

      const posts = readPosts();
      posts.push(newPost);
      writePosts(posts);

      res.status(201).json(newPost); 
    });
  } else if (req.method === 'GET') {
    // Handle GET request (fetching all posts)
    try {
      const posts = readPosts();
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error reading posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else {
    res.status(405).end();  // Method Not Allowed
  }
};
