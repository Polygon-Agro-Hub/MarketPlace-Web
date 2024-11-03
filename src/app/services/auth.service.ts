import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient, HttpHeaders   } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.API_URL}`;
  private readonly SHOUTOUT_API_KEY = `${environment.SHOUTOUT_API_KEY}`;
  private readonly SHOUTOUT_URL = `${environment.SHOUTOUT_URL}`;

  private tempUserData = new BehaviorSubject<any>(null);
  currentTempUser = this.tempUserData.asObservable();

  constructor(private http: HttpClient) { }


  login(email: string, password: string): Observable<any> {
    const loginObj = { email, password };
    return this.http.post<any>(`${this.apiUrl}auth/login`, loginObj);
  }


  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/signup`, userData);
  }


  sendOTP(phoneNumber: string): Observable<any> {
    const otp = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.SHOUTOUT_API_KEY}`,
      'Content-Type': 'application/json'
    });

    const num : string = `94${phoneNumber}`;

    const messageBody = {
      source: "ShoutDEMO",
      destinations: [num],
      content: {
        sms: `Your MyFarm verification code is: ${otp}`
      },
      transports: ["sms"]
    };

    // Store OTP temporarily (in production, this should be handled securely on the backend)
    localStorage.setItem('currentOTP', otp);

    return this.http.post(this.SHOUTOUT_URL, messageBody, { headers });
  }


  verifyOTP(enteredOTP: string): boolean {
    const storedOTP = localStorage.getItem('currentOTP');
    return storedOTP === enteredOTP;
  }

  setTempUserData(data: any) {
    this.tempUserData.next(data);
  }

  clearTempData() {
    localStorage.removeItem('currentOTP');
    this.tempUserData.next(null);
  }

}
