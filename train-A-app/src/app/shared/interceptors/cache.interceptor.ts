import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, share, tap } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }
  const cached = cache.get(req.url);
  if (cached) {
    return of(cached);
  }
  return next(req).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, event.clone());
      }
    }),
    share(),
  );
};
