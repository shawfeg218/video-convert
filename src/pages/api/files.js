import { promises as fs, existsSync } from 'fs';
import path from 'path';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const folder = req.body.folder;

      const directoryPath = path.join(process.cwd(), folder);

      // 檢查文件夾是否存在
      if (!existsSync(directoryPath)) {
        // 如果文件夾不存在，創建它
        await fs.mkdir(directoryPath, { recursive: true });
      }

      const files = await fs.readdir(directoryPath);
      res.status(200).json(files);
    } catch (error) {
      console.log('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
};
