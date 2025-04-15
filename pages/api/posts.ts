import { NextApiRequest, NextApiResponse } from 'next';

let posts: { title: string; content: string }[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, content } = req.body;
    const newPost = { title, content };
    posts.push(newPost);
    return res.status(201).json(newPost);
  }

  if (req.method === 'GET') {
    return res.status(200).json(posts);
  }

  res.status(405).end(); // Method Not Allowed
}
