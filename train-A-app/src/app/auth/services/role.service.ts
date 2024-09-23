import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { UserProfileService } from '../../user-profile/services/user-profile.service';
import { initialState } from '../_state/roles.reducer';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http: HttpClient = inject(HttpClient);

  private userRole = initialState;

  private userProfileService = inject(UserProfileService);

  public isAuthorized(): Observable<string> {
    if (this.userRole !== initialState) {
      return of(this.userRole);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return new Observable((observer) => {
        observer.next('guest');
        observer.complete();
      });
    }
    return this.userProfileService.loadUserProfile().pipe(
      map((response) => response.role),
      catchError(() => 'guest'),
    );
  }
}
