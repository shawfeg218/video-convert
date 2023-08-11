import { useState, useEffect } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles('uploads');
  }, [files]);

  useEffect(() => {
    fetchFiles('results');
  }, [convertedFiles]);

  const fetchFiles = async (folder) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: folder }),
      });
      const data = await response.json();

      if (folder === 'uploads') {
        setFiles(data);
      } else if (folder === 'converted') {
        setConvertedFiles(data);
      }
    } catch (error) {
      console.log('Failed to fetch files:', error);
    }
  };

  const handleVideoTransform = async (fileName) => {
    setLoading(true);
    console.log('fileName:', fileName);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: JSON.stringify({ fileName: fileName, format: format }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('data:', data);
    } catch (error) {
      console.error('Failed to transform video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div className="w-96">
        <section>
          <ul className="h-52 overflow-y-auto bg-white p-1 rounded-md">
            {files.length === 0 && <h1>No video to convert</h1>}
            {files.length !== 0 && <h1>Select a file to convert</h1>}
            {files.map((file) => (
              <div
                key={file}
                className="flex items-center justify-between bg-slate-100 pl-1 rounded-md mt-1"
              >
                <li>{file}</li>

                <div className="flex justify-between items-center">
                  <p>轉換成</p>
                  <select
                    className="ml-1"
                    onChange={(e) => {
                      setFormat(e.target.value);
                    }}
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WEBM</option>
                    <option value="ogg">OGG</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="flv">FLV</option>
                    <option value="mpeg">MPEG</option>
                  </select>
                  <button
                    className="ml-2 bg-black text-white p-2 rounded-md"
                    onClick={() => handleVideoTransform(file)}
                  >
                    轉檔
                  </button>
                </div>
              </div>
            ))}
          </ul>
          {loading && <p>轉檔中...</p>}
        </section>
        <section className="mt-4">
          <ul className="h-52 overflow-y-auto bg-white rounded-md p-1">
            <h1>Converted files</h1>
            {convertedFiles.length === 0 && (
              <p className="text-center mt-12">No converted files yet.</p>
            )}
            {convertedFiles.map((file) => (
              <div
                key={file}
                className="flex items-center justify-between bg-slate-100 pl-1 rounded-md mt-1"
              >
                <li>{file}</li>
              </div>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
