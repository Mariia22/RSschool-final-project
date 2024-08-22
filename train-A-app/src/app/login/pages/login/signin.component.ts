import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { noSpaceValidator } from '../../../shared/utils/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, RouterOutlet, ReactiveFormsModule, MatButtonModule, NgIf, CommonModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss', './../../../core/styles/common.scss'],
})
export class SigninComponent implements OnInit, OnDestroy {
  private fb: FormBuilder = inject(FormBuilder);

  private http: HttpClient = inject(HttpClient);

  private router: Router = inject(Router);

  private subscriptions: Subscription = new Subscription();

  public isSubmitted: boolean = false;

  public isSubmitting: boolean = false;

  public loginForm!: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  public ngOnInit() {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.pattern(/^[\w\d_]+@[\w\d_]+.\w{2,7}$/)]],
      password: ['', [noSpaceValidator()]],
    });
    this.subscriptions.add(this.email?.valueChanges.subscribe(() => this.resetServerErrors()));
    this.subscriptions.add(this.password?.valueChanges.subscribe(() => this.resetServerErrors()));
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  private resetServerErrors() {
    if (this.email?.hasError('serverError') || this.password?.hasError('serverError')) {
      this.email?.setErrors(null);
      this.password?.setErrors(null);
    }
  }

  public onSubmit() {
    this.isSubmitted = true;
    this.isSubmitting = true;
    this.signIn();
  }

  // TODO: replace http request to auth service
  // signIn(email: string, password: string): Observable<{ token: string }> {
  //   return this.http.post<{ token: string }>('/api/signin', {
  //     email,
  //     password,
  //   });
  // }
  public signIn() {
    const { email, password } = this.loginForm.getRawValue();
    const sub = this.http
      .post<{ token: string }>('/api/signin', {
        email,
        password,
      })
      .subscribe({
        next: (response) => {
          // TODO: we need a flag inside service, pointing user is isAuthenticated or not
          // this.isAuthenticated = true
          localStorage.setItem('token', response.token);
          this.router.navigateByUrl('/');
        },
        error: () => {
          this.email?.setErrors({ serverError: true });
          this.password?.setErrors({ serverError: true });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    this.subscriptions.add(sub);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
