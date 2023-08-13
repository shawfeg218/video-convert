// api/checkConvert.js

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests allowed.');
    }

    const file = conversionStatus.file;
    const status = conversionStatus.status;
    console.log('file: ' + file + ', status: ' + status);

    res.status(200).json({ file: file, status: status });
  } catch (error) {
    console.log('Error in checkConvert:', error.message);
    res.status(500).json({ error: error.message });
  }
};
