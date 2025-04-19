import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to use formidable
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

    const form = new IncomingForm();
    form.uploadDir = imagesDir;
    form.keepExtensions = true;
    form.multiples = false; // Only allow one image per post for now

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Form parsing failed. Please try again.' });
      }

      // Extract title and content, ensuring they are strings (handle arrays from form data)
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const content = Array.isArray(fields.content) ? JSON.parse(fields.content[0]) : []; // Parse content as an array
      const file = files.image?.[0];

      // Validate title and content
      if (!title || content.length === 0) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      if (title.trim().length < 5) {
        return res.status(400).json({ error: 'Title must be at least 5 characters long' });
      }

      if (content.join(' ').trim().length < 20) {
        return res.status(400).json({ error: 'Content must be at least 20 characters long' });
      }

      let imagePath = null;

      // Handle file upload if there is an image
      if (file) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
        if (file.size > MAX_SIZE) {
          return res.status(400).json({ error: 'File size exceeds 5MB' });
        }

        // Store the image path
        imagePath = `/images/${file.newFilename}`;
      }

      try {
        // Connect to the database
        const client = await clientPromise;
        const db = client.db('my-blog-db');
        const collection = db.collection('posts');

        // Create the new post document
        const newPost = {
          title,
          content,
          image: imagePath,
          date: new Date().toLocaleDateString('en-NZ'),
        };

        // Insert the new post into the database
        await collection.insertOne(newPost);

        res.status(201).json({ message: 'Post created successfully', post: newPost });
      } catch (dbErr) {
        console.error('MongoDB insert error:', dbErr);
        res.status(500).json({ error: 'Failed to save post to database. Please try again.' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('my-blog-db');
      const collection = db.collection('posts');

      const posts = await collection.find().sort({ date: -1 }).toArray();

      res.status(200).json(posts);
    } catch (err) {
      console.error('MongoDB fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch posts. Please try again.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
