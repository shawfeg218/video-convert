// api/abortConvert.js

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests allowed.');
    }

    if (currentFfmpegCommand) {
      currentFfmpegCommand.kill();
      currentFfmpegCommand = null;
      res.status(200).json({ message: 'FFmpeg process aborted.' });
    } else {
      res.status(404).json({ message: 'No FFmpeg process running.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
