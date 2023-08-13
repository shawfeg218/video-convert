import { useState, useEffect } from 'react';
import { MdRefresh } from 'react-icons/md';

export default function Home() {
  const [inputDir, setInputDir] = useState({ forInput: true, path: 'uploads' });
  const [outputDir, setOutputDir] = useState({ forInput: false, path: 'results' });

  const [files, setFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);

  const [formats, setFormats] = useState({});
  const [fps, setFps] = useState({});
  const [size, setSize] = useState({});
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
    fetchFiles(inputDir);
    fetchFiles(outputDir);
  }, []);

  useEffect(() => {
    if (waiting.length === 0 || processing) return;
    handleVideoTransform();
  }, [waiting, processing]);

  useEffect(() => {
    if (processing === false) return;
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [processing]);

  const fetchFiles = async (dir) => {
    try {
      const folder = dir.path;
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

      if (dir.forInput === true) {
        setFiles(data);
      } else if (dir.forInput === false) {
        setConvertedFiles(data);
      }
    } catch (error) {
      console.log(error.message);
      window.alert(error.message);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/checkConvert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversion status');
      }

      const responseJson = await response.json();
      const file = responseJson.file;
      const status = responseJson.status;
      console.log('file: ' + file + ', status: ' + status);

      if (status === 'completed') {
        setWaiting((prev) => prev.slice(1));
        setProcessing(false);
        setMessage(`${file} 轉檔完成`);
        fetchFiles(outputDir);
      } else if (status === 'failed') {
        setWaiting((prev) => prev.slice(1));
        setProcessing(false);
        window.alert(`${file} 轉檔失敗`);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleVideoTransform = async () => {
    const file = waiting[0].file;
    const format = waiting[0].format;
    const fps = waiting[0].fps;
    const size = waiting[0].size;

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: JSON.stringify({
          file: file,
          format: format,
          fps: fps,
          size: size,
          inputDir: inputDir.path,
          outputDir: outputDir.path,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log('errorResponse:', errorResponse);
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      console.log(data.message);
      setMessage(data.message);
      setProcessing(true);
    } catch (error) {
      console.log(error.message);
      window.alert(error.message);
      setProcessing(false);
    }
  };

  const handleAbort = async () => {
    if (!processing) return;
    try {
      const response = await fetch('/api/abortConvert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const responseJson = await response.json();
      console.log(responseJson.message);
      setMessage(`${waiting[0].file} 轉檔 ${waiting[0].format} 已取消`);
    } catch (error) {
      console.log(error.message);
      window.alert(error.message);
    }
  };

  const handleCancelWaiting = (index) => {
    setWaiting((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <div className="flex flex-wrap min-h-screen w-full justify-around px-8 py-10 ">
        <section className="min-h-full w-full max-w-xl bg-white px-2 pt-3 pb-1 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1>輸入路徑:</h1>
              <input
                type="text"
                placeholder={`Default:  Path/to/video-convert/${inputDir.path}`}
                className="border-2 rounded-md w-96 text-sm p-1 ml-2"
                onChange={(e) => setInputDir({ forInput: true, path: e.target.value || 'uploads' })}
              />
            </div>
            <button
              className="mr-2 h-8 w-8 flex justify-center items-center border-slate-400 border-2 rounded-sm"
              onClick={() => {
                fetchFiles(inputDir);
              }}
            >
              <MdRefresh className="text-slate-500" />
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto mt-2 h-3/4">
            {files.length === 0 && <p className="text-center mt-12">No files in this folder.</p>}
            {files.map((file) => (
              <div
                key={file}
                className="flex items-center justify-between bg-slate-100 pl-1 rounded-md mt-1"
              >
                <li className="w-56 truncate overflow-hidden" title={file}>
                  {file}
                </li>

                <div className="flex justify-between items-center">
                  <p>轉換成</p>
                  <select
                    className="ml-1"
                    onChange={(e) => {
                      setSize((prev) => ({
                        ...prev,
                        [file]: e.target.value,
                      }));
                    }}
                  >
                    <option value="1080">1080p</option>
                    <option value="720">720p</option>
                    <option value="1440">1440p</option>
                    <option value="2160">2160p</option>
                  </select>
                  <select
                    className="ml-1"
                    onChange={(e) => {
                      setFps((prev) => ({
                        ...prev,
                        [file]: e.target.value,
                      }));
                    }}
                  >
                    <option value="30">30fps</option>
                    <option value="24">24fps</option>
                    <option value="60">60fps</option>
                  </select>

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
                        {
                          file: file,
                          format: formats[file] || 'mp4',
                          fps: fps[file] || 30,
                          size: size[file] || 1080,
                        },
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

          <div className="mt-2 border-t-2 max-h-28 overflow-y-scroll ">
            {waiting.length === 0 ? (
              <p>沒有影片等待轉檔</p>
            ) : (
              <>
                <div className="flex">
                  <p>
                    {waiting[0].file} to {waiting[0].format.toUpperCase()} 轉檔中...
                  </p>
                  <button onClick={handleAbort} className="ml-2 text-blue-600">
                    點此取消
                  </button>
                </div>
                <p>{waiting.length - 1} 個影片等待中...</p>
                {waiting.slice(1).map((item, index) => (
                  <div key={index + 1} className="flex">
                    <p className="w-3/4 overflow-hidden truncate" title={item.file}>
                      {item.file} 轉檔 {item.format.toUpperCase()} 等待中...
                    </p>
                    <button
                      onClick={() => handleCancelWaiting(index + 1)}
                      className="ml-2 text-blue-600"
                    >
                      點此取消
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="min-h-full w-full max-w-xl bg-white px-2 py-3 pb-1 rounded-md max-xl:mt-4 relative">
          {message && (
            <div className="flex justify-center absolute top-1/2 left-0 w-full">
              <div className="border-2 border-slate-300 p-2 rounded-md bg-white max-w-md">
                <p className="font-bold text-xl text-center overflow-hidden">{message}</p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1>輸出路徑:</h1>
              <input
                type="text"
                placeholder={`Default:  Path/to/video-convert/${outputDir.path}`}
                className="border-2 rounded-md w-96 text-sm p-1 ml-2"
                onChange={(e) =>
                  setOutputDir({ forInput: false, path: e.target.value || 'results' })
                }
              />
            </div>
            <button
              className="mr-2 h-8 w-8 flex justify-center items-center border-slate-400 border-2 rounded-sm"
              onClick={() => {
                fetchFiles(outputDir);
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
                <li className="truncate overflow-hidden" title={file}>
                  {file}
                </li>
              </div>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
