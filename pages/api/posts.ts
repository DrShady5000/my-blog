import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('my-blog-db');
      const posts = db.collection('posts');

      const newPost = {
        title,
        content,
        date: new Date().toISOString(),
      };

      const result = await posts.insertOne(newPost);

      res.status(201).json({
        message: 'Post created successfully',
        post: newPost,
        insertedId: result.insertedId,
      });
    } catch (error) {
      console.error('DB error:', error);
      res.status(500).json({ error: 'Failed to save post to the database.' });
    }
  } else if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('my-blog-db');
      const posts = db.collection('posts');

      const allPosts = await posts.find().sort({ date: -1 }).toArray();

      res.status(200).json(allPosts);
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ error: 'Unable to fetch posts.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
