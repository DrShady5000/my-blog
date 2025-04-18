import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

// Define paths for post storage and image uploads
const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');
const imagesDir = path.join(process.cwd(), 'public', 'images');

// Reads all posts from the JSON file
const readPosts = () => {
  const fileContent = fs.readFileSync(postsFilePath, 'utf-8');
  return JSON.parse(fileContent);
};

// Writes updated post data to the JSON file
const writePosts = (posts: any[]) => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
};

// Ensures the image upload folder exists
const ensureImagesDirExists = () => {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};

// Disables Next.js default body parsing (needed for file uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

// API Route Handler
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    ensureImagesDirExists(); // Create image directory if missing

    const form = new IncomingForm();
    form.uploadDir = imagesDir;
    form.keepExtensions = true;

    // Validate file before saving
    form.on('fileBegin', (name, file) => {
      if (file) {
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
          return res.status(400).json({ error: 'Only image files are allowed.' });
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB size limit
        if (file.size > MAX_SIZE) {
          return res.status(400).json({ error: 'File size must be less than 5MB.' });
        }
      }
    });

    // Parse form data and handle post creation
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse the form' });
      }

      const { title, content } = fields;
      const image = files.image ? `/images/${files.image[0].newFilename}` : null;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }

      // Create new post object
      const newPost = {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString(),
        image,
      };

      // Save post to file
      const posts = readPosts();
      posts.push(newPost);
      writePosts(posts);

      res.status(201).json(newPost);
    });

  } else if (req.method === 'GET') {
    // Return all posts
    try {
      const posts = readPosts();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }

  } else {
    // Method not allowed
    res.status(405).end();
  }
};
