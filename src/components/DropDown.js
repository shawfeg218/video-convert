export default function DropDown() {
  return (
    <div className="right-0 mt-2 w-20 rounded-md shadow-lg bg-white">
      <div className="rounded-md bg-white shadow-xs">
        <a
          onClick={() => handleConvert(file, 'mp4')}
          className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100"
        >
          MP4
        </a>
        <a
          onClick={() => handleConvert(file, 'avi')}
          className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100"
        >
          AVI
        </a>
        {/* Add more formats as needed */}
      </div>
    </div>
  );
}
