import { Injectable } from '@angular/core';
import { Observable, of, delay, switchMap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  // Mock user data for testing
  private readonly mockUsers = [
    {
      email: 'admin@ltt.com',
      password: 'password123',
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@ltt.com',
        role: 'supervisor',
        department: 'IT'
      }
    },
    {
      email: 'sme@ltt.com',
      password: 'password123',
      user: {
        id: 2,
        name: 'SME User',
        email: 'sme@ltt.com',
        role: 'sme',
        department: 'Engineering'
      }
    }
  ];

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('MockApiService.login called with:', credentials);

    // Simulate network delay
    return of(null).pipe(
      delay(1000),
      switchMap(() => {
        const user = this.mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          const response: LoginResponse = {
            token: 'mock-jwt-token-' + Date.now(),
            user: user.user,
            expiresIn: 3600 // 1 hour
          };
          console.log('Mock login successful:', response);
          return of(response);
        } else {
          console.log('Mock login failed: Invalid credentials');
          return throwError(() => ({
            error: { message: 'Invalid email or password' }
          }));
        }
      })
    );
  }
}
