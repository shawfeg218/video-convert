import { useState, useEffect } from 'react';
import { MdRefresh } from 'react-icons/md';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);

  const [formats, setFormats] = useState({});
  const [processing, setProcessing] = useState(false);
  const [waiting, setWaiting] = useState([]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [message]);

  useEffect(() => {
    fetchFiles('uploads');
    fetchFiles('results');
  }, []);

  useEffect(() => {
    if (waiting.length === 0 || processing) return;
    handleTask();
  }, [waiting, processing]);

  const handleTask = async () => {
    const item = waiting[0];
    if (item) {
      handleVideoTransform();
    }
  };

  const fetchFiles = async (folder) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: folder }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files in ' + folder);
      }

      const data = await response.json();
      // console.log('data:', data);

      if (folder === 'uploads') {
        setFiles(data);
      } else if (folder === 'results') {
        setConvertedFiles(data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleVideoTransform = async () => {
    setProcessing(true);
    const file = waiting[0].file;
    const format = waiting[0].format;
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: JSON.stringify({ file: file, format: format }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to transform ${file} to ${format}`);
      }
      const data = await response.json();
      console.log('data:', data.message);
      setMessage(data.message);

      fetchFiles('results');
    } catch (error) {
      console.log(error.message);
      window.alert(error.message);
    } finally {
      setWaiting((prev) => prev.slice(1));
      setProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <div className="flex flex-wrap min-h-screen w-full justify-around px-8 py-10 ">
        <section className="min-h-full w-full max-w-xl bg-white p-2 rounded-md">
          <div className="flex justify-between items-center">
            {files.length === 0 && <h1>No video to convert</h1>}
            {files.length !== 0 && <h1>Select file to convert</h1>}
            <button
              className="mr-2 h-8 w-8 flex justify-center items-center border-slate-400 border-2 rounded-sm"
              onClick={() => {
                fetchFiles('uploads');
              }}
            >
              <MdRefresh className="text-slate-500" />
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto mt-2 h-3/4">
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
                      setFormats((prev) => ({
                        ...prev,
                        [file]: e.target.value,
                      }));
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
                    className="ml-2 bg-black text-white p-2 rounded-md disabled:bg-slate-300"
                    onClick={() => {
                      setWaiting((prev) => [
                        ...prev,
                        { file: file, format: formats[file] || 'mp4' },
                      ]);
                    }}
                    // disabled={loading}
                  >
                    轉檔
                  </button>
                </div>
              </div>
            ))}
          </ul>

          <div className="mt-2 border-t-2 h-1/6 overflow-y-scroll ">
            {waiting.length === 0 ? (
              <p>沒有影片等待轉檔</p>
            ) : (
              <>
                <p>
                  {waiting[0].file} 轉檔中, {waiting.length - 1} 個影片等待中...
                </p>
                {waiting.map((item, index) => (
                  <p key={index}>
                    {item.file} 轉檔 {item.format.toUpperCase()} ...
                  </p>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="min-h-full w-full max-w-xl bg-white p-2 rounded-md max-xl:mt-4 relative">
          {message && (
            <div className="flex justify-center absolute top-1/2 left-0 w-full">
              <div className="border-2 border-slate-300 p-2 rounded-md bg-white">
                <p className="font-bold text-xl">{message}</p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <h1>Converted files</h1>
            <button
              className="mr-2 h-8 w-8 flex justify-center items-center border-slate-400 border-2 rounded-sm"
              onClick={() => {
                fetchFiles('results');
              }}
            >
              <MdRefresh className="text-slate-500" />
            </button>
          </div>
          <ul
            className="overflow-y-auto bg-white rounded-md p-1 mt-2"
            style={{ maxHeight: '500px' }}
          >
            {convertedFiles.length === 0 && (
              <p className="text-center mt-12">No converted files yet.</p>
            )}
            {convertedFiles.map((file) => (
              <div
                key={file}
                className="flex items-center justify-between bg-slate-100 pl-1 rounded-md mt-1 h-10"
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
