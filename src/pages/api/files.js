import { promises as fs, existsSync } from 'fs';
import path from 'path';

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests allowed.');
    }
    const folder = req.body.folder;

    let directoryPath;
    if (folder === 'uploads' || folder === 'results') {
      directoryPath = path.join(process.cwd(), folder);
    } else {
      directoryPath = path.join(folder);
    }
    // console.log('directoryPath: ', directoryPath);

    // check if directory exists
    if (folder === 'uploads' || folder === 'results') {
      if (!existsSync(directoryPath)) {
        await fs.mkdir(directoryPath, { recursive: true });
      }
    } else {
      if (!existsSync(directoryPath)) {
        throw new Error('Directory does not exist.');
      }
    }

    const files = await fs.readdir(directoryPath);
    res.status(200).json(files);
  } catch (error) {
    console.log('Error fetching files:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};
