// utils/ffmpeg.js
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
import fs from 'fs';

global.conversionStatus = global.conversionStatus || { file: '', status: '' };

export const convertVideo = async (file, format) => {
  try {
    const inputPath = path.join(process.cwd(), 'uploads', file);
    const parsedPath = path.parse(file);
    const outputFileName = parsedPath.name;
    const outputPath = path.join(process.cwd(), 'results', `${outputFileName}.${format}`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .outputFormat(format)
        .on('start', () => {
          console.log('ffmpeg start converting...');
          conversionStatus = { file: file, status: 'processing' };
        })
        .on('end', () => {
          console.log('ffmpeg finished converting.');
          conversionStatus = { file: file, status: 'completed' };
          resolve();
        })
        .on('error', (error) => {
          console.error('ffmpeg error:', error.message);
          conversionStatus = { file: file, status: 'failed' };
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          reject(
            new Error(`Failed to convert ${file} to ${format.toUpperCase()}: ${error.message}`)
          );
        })
        .save(outputPath);
    });
  } catch (error) {
    console.log(error.message);
    conversionStatus = { file: file, status: 'failed' };
  }
};
