import { Observable } from 'rxjs';

type FileSystemFileHandle = any;
export function showOpenFilePicker() {
  return new Observable((subscriber) => {
    let isClosed = false;
    const showOpenFilePickerPromise: Promise<FileSystemFileHandle[]> = (
      window as any
    ).showOpenFilePicker();

    showOpenFilePickerPromise
      .then(([fileHandle]) => {
        if (!isClosed) {
          subscriber.next(fileHandle);
          subscriber.complete();
        }
      })
      .catch((err) => {
        subscriber.error(err);
      });

    return {
      unsubscribe: () => {
        isClosed = true;
      },
    };
  });
}
