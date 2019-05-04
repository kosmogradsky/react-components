import { Observable, Subscriber } from 'rxjs';

export const readFile = (blob: Blob) => Observable.create((observable: Subscriber<string>) => {
  if (!(blob instanceof Blob)) {
    observable.error(new Error('`blob` must be an instance of File or Blob.'));
    return;
  }

  const reader = new FileReader();

  reader.onerror = err => observable.error(err);
  reader.onabort = err => observable.error(err);
  reader.onload = () => observable.next(reader.result as string);
  reader.onloadend = () => observable.complete();

  return reader.readAsDataURL(blob);
});
