import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api';
import { LoginRequest, LoginResponse, SME } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<SME | null>(null);
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      this.tokenSubject.next(token);
      const parsedUser = JSON.parse(user);
      this.currentUserSubject.next(parsedUser);
      this.isLoggedIn$.next(true);

      // Refresh user details from API to ensure we have the latest data
      if (parsedUser.email) {
        this.loadCurrentUserDetails();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService.login called with:', credentials);
    return this.apiService.login(credentials).pipe(
      tap(response => {
        console.log('Login response received:', response);

        // Check if response has the expected structure
        if (!response?.token) {
          console.error('Invalid login response - missing token:', response);
          throw new Error('Invalid login response');
        }

        // If user object is provided in response, use it
        if (response.user?.email) {
          this.setAuthData(response.token, response.user);
          // Fetch complete user details after login
          this.loadCurrentUserDetails();
        } else {
          // If no user object, try to get user details using the /me endpoint
          console.log('No user object in response, fetching details via /me API');
          this.tokenSubject.next(response.token);
          this.isLoggedIn$.next(true);
          localStorage.setItem('authToken', response.token);

          // Fetch user details using the /me endpoint
          this.loadCurrentUserDetails();
        }
      })
    );
  }

  private loadCurrentUserDetails(): void {
    console.log('Loading current user details via /me API');

    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('User details loaded:', user);
        if (user) {
          this.currentUserSubject.next(user);
          // Update localStorage with complete user data
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          console.error('Received null/undefined user from API');
        }
      },
      error: (error) => {
        console.error('Failed to load user details:', error);
        // Keep the user from login response if API call fails
        // Don't throw error to prevent login flow from breaking
      }
    });
  }

  private setAuthData(token: string, user: SME): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.isLoggedIn$.next(true);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isLoggedIn$.next(false);

    this.router.navigate(['/login']);
  }

  getCurrentUser(): SME | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn$.value;
  }
}
