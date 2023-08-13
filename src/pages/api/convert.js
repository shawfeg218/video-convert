// api/convert.js
import { convertVideo } from '@/utils/ffmpeg';

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests allowed.');
    }

    const { file, format, fps, size, inputDir, outputDir } = req.body;

    // 檢查輸入
    if (!file || !format) {
      throw new Error('Missing required fields: fileName and format.');
    }

    // 使用 setImmediate 來啟動非同步的轉檔操作
    setImmediate(() => {
      convertVideo(file, format, fps, size, inputDir, outputDir);
    });

    // 立即回傳response
    res.status(200).json({ message: `Conversion for ${file} started.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
