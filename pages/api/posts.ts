import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parsing for file uploads
  },
};

const imagesDir = path.join(process.cwd(), 'public', 'images');

// Ensure the images directory exists
const ensureImagesDirExists = () => {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    ensureImagesDirExists();

    const form = new IncomingForm({ multiples: false, keepExtensions: true, uploadDir: imagesDir });

    // Parse the incoming form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return res.status(500).json({ error: 'Failed to parse form data.' });
      }

      // Debugging log to check the fields being received
      console.log('fields:', fields);
      console.log('files:', files);

      // Normalize title and content
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }

      let imagePath: string | null = null;

      // Handle the image file upload
      if (files.image && !Array.isArray(files.image)) {
        const file = files.image;
        const MAX_SIZE = 5 * 1024 * 1024; // 5 MB limit

        // Check if the file size exceeds the limit
        if (file.size && file.size > MAX_SIZE) {
          return res.status(400).json({ error: 'Image exceeds 5MB limit.' });
        }

        // Set the image path for storage
        imagePath = `/images/${path.basename(file.filepath)}`;
      }

      try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('my-blog-db');
        const posts = db.collection('posts');

        // Create the new post object
        const newPost = {
          title,
          content, 
          image: imagePath,
          date: new Date().toISOString(), 
        };

        console.log('New post object:', newPost);

        const result = await posts.insertOne(newPost);

        // Respond with the success message and post details
        res.status(201).json({ message: 'Post created successfully', post: newPost, insertedId: result.insertedId });
      } catch (dbError) {
        console.error('DB error:', dbError);
        res.status(500).json({ error: 'Failed to save post to the database.' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db('my-blog-db');
      const posts = db.collection('posts');

      // Fetch all posts from the database, sorted by date
      const allPosts = await posts.find().sort({ date: -1 }).toArray();

      // Respond with the posts
      res.status(200).json(allPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      res.status(500).json({ error: 'Unable to fetch posts from the database.' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
