// import { defer, Observable } from 'rxjs';

// export function showSaveFilePicker() {
//   return defer(async () => {
//     // create a new handle
//     const newHandle = await (window as any).showSaveFilePicker();

//     // create a FileSystemWritableFileStream to write to
//     const writableStream = await newHandle.createWritable();

//     // write our file
//     await writableStream.write(imgBlob);

//     // close the file and write the contents to disk.
//     await writableStream.close();
//   });
// }
