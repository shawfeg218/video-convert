import { promises as fs, existsSync } from 'fs';
import path from 'path';

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests allowed.');
    }
    const folder = req.body.folder;

    const directoryPath = path.join(process.cwd(), folder);

    // check if directory exists
    if (!existsSync(directoryPath)) {
      await fs.mkdir(directoryPath, { recursive: true });
    }

    const files = await fs.readdir(directoryPath);
    res.status(200).json(files);
  } catch (error) {
    console.log('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};
