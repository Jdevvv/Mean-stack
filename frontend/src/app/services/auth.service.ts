import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { map } from 'rxjs/operators';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  domain = "http://localhost:8080/";
  authToken;
  user;
  options;

  constructor(
    private http: Http
  ) { }

  createAuthentificationHeaders() {
    this.loadToken();
    this.options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json',
        'authorization': this.authToken
      })
    });
  }

  loadToken() {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }
 
    registerUser(user) {
      return this.http.post(this.domain + 'authentification/register', user).pipe(map(res => res.json()));
    }

    checkUsername(username) {
      return this.http.get(this.domain + 'authentification/checkUsername/' + username).pipe(map(res => res.json()));
    }

    checkEmail(email) {
      return this.http.get(this.domain + 'authentification/checkEmail/' + email).pipe(map(res => res.json()));
    }

    login(user) {
      return this.http.post(this.domain + 'authentification/login', user).pipe(map(res => res.json()));
    }

    logout() {
      this.authToken = null;
      this.user = null;
      localStorage.clear();
    }

    storeUserData(token, user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.authToken = token;
      this.user = user;
    }

    getProfile() {
      this.createAuthentificationHeaders();
      return this.http.get(this.domain + 'authentification/profile', this.options).pipe(map(res => res.json()));
    }

    loggedIn() {
      return tokenNotExpired();
    }

    ngOnInit() {
      const token = localStorage.getItem('token'); 
      if (token) {
        if (this.loggedIn()) {
          this.loadToken(); 
        } else {
          this.logout(); 
        }
      } else {
        this.logout(); 
      }
  
  }

}
