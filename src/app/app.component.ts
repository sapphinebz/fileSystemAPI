import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  catchError,
  defer,
  EMPTY,
  exhaustMap,
  fromEvent,
  merge,
  ReplaySubject,
  share,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('saveFileButton', { read: ElementRef }) set saveFileButtonRef(
    el: ElementRef<HTMLButtonElement>
  ) {
    this.saveFileButtonEl$.next(el);
  }
  @ViewChild('saveAsFileButton', { read: ElementRef }) set saveAsFileButtonRef(
    el: ElementRef<HTMLButtonElement>
  ) {
    this.saveAsFileButtonEl$.next(el);
  }
  @ViewChild('openFileButton', { read: ElementRef }) set openFileButtonRef(
    el: ElementRef<HTMLButtonElement>
  ) {
    this.openFileButtonEl$.next(el);
  }
  saveFileButtonEl$ = new ReplaySubject<ElementRef<HTMLButtonElement>>(1);
  saveAsFileButtonEl$ = new ReplaySubject<ElementRef<HTMLButtonElement>>(1);
  openFileButtonEl$ = new ReplaySubject<ElementRef<HTMLButtonElement>>(1);
  openFileHandle$ = this.openFileButtonEl$.pipe(
    switchMap((el) => {
      return fromEvent(el.nativeElement, 'click');
    }),
    switchMap(async () => {
      const [fileHandle] = await (window as any).showOpenFilePicker();
      return fileHandle;
    }),
    shareReplay(1)
  );

  onSaveAsSuccess$ = this.saveAsFileButtonEl$.pipe(
    switchMap((el) => {
      return fromEvent(el.nativeElement, 'click');
    }),
    exhaustMap(() => {
      return defer(async () => {
        const handle = await (window as any).showSaveFilePicker({
          types: [
            {
              accept: {
                'text/plain': ['.txt'],
              },
            },
          ],
        });

        const content = this.textAreaControl.value;

        // Create a FileSystemWritableFileStream to write
        const writable = await handle.createWritable();

        // Write the contents of the file to the stream
        await writable.write(content);

        // Close the file and write the contents to disk
        await writable.close();
        return handle;
      }).pipe(
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
    }),
    share()
  );

  onSaveFileHandleSuccess$ = this.saveFileButtonEl$.pipe(
    switchMap((el) => {
      return fromEvent(el.nativeElement, 'click');
    }),
    withLatestFrom(this.openFileHandle$),
    exhaustMap(([_, fileHandle]) => {
      return defer(async () => {
        const writable = await fileHandle.createWritable();
        const content = this.textAreaControl.value;
        await writable.write(content);
        await writable.close();
      }).pipe(
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
    }),
    share()
  );

  text$ = this.openFileHandle$.pipe(
    switchMap(async (fileHandle) => {
      const file = await fileHandle.getFile();
      return file.text();
    })
  );

  title = 'fileSystemAPI';

  textAreaControl = new FormControl();

  constructor() {
    this.text$.subscribe((text) => {
      this.textAreaControl.setValue(text);
    });

    merge(this.onSaveFileHandleSuccess$, this.onSaveAsSuccess$).subscribe(
      () => {
        window.alert('save successfully !');
      }
    );
  }
}
