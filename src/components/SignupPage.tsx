import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import emailjs from '@emailjs/browser';
import logoImage from "../assets/Logo.png";
import { Icon3D } from "./ui/Icon3D";

interface SignupPageProps {
  onSignup: (name: string, email: string, phone: string) => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize EmailJS
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
      console.log('EmailJS initialized successfully');
    }
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if email already exists
      const existingPassword = localStorage.getItem(`user_password_${email}`);
      if (existingPassword) {
        toast.error("Account already exists. Please login.");
        setIsLoading(false);
        return;
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otpCode);

      console.log('Sending OTP to:', email);
      console.log('Generated OTP:', otpCode);

      // Send OTP via EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      console.log('EmailJS Config:', { serviceId, templateId });

      const templateParams = {
        to_email: email,
        to_name: name,
        otp_code: otpCode,
        from_name: "EtherX Excel",
        message: `Your OTP code is: ${otpCode}. This code will expire in 10 minutes.`
      };

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      console.log('EmailJS Response:', response);
      toast.success("OTP sent to your email! Please check your inbox.");
      setShowOtpScreen(true);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      console.error('Error details:', error.text || error.message);
      toast.error(`Failed to send OTP: ${error.text || error.message || 'Please try again.'}`);
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Save user data to localStorage after OTP verification
      localStorage.setItem(`user_password_${email}`, password);
      localStorage.setItem(`user_name_${email}`, name);
      localStorage.setItem(`user_phone_${email}`, phone);
      
      toast.success("Account created successfully! Please login.");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSwitchToLogin();
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error('Failed to create account. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="dark" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-wrapper">
              <img src={logoImage} alt="EtherX Excel" />
            </div>
            <h1 className="auth-title">
              {showOtpScreen ? "Verify OTP" : "Create Account"}
            </h1>
            <p className="auth-subtitle">
              {showOtpScreen ? `Enter the OTP sent to ${email}` : "Join EtherX Excel today"}
            </p>
          </div>

          {showOtpScreen ? (
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">Enter OTP</label>
                <div className="relative">
                  <img src="/icons/3d/mail.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7 }} />
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-input"
                    maxLength={6}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="btn btn-secondary w-full mt-3"
                disabled={isLoading}
              >
                Back to Signup
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <div className="relative">
                  <img src="/icons/3d/user.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7 }} />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <div className="relative">
                  <img src="/icons/3d/mail.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7 }} />
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone (Optional)</label>
                <div className="relative">
                  <img src="/icons/3d/phone.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7 }} />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="relative">
                  <img src="/icons/3d/lock.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7, pointerEvents: 'none' }} />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="relative">
                  <img src="/icons/3d/lock.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7, pointerEvents: 'none' }} />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="auth-links">
                <span style={{ color: 'rgb(255, 255, 255)', WebkitTextFillColor: 'rgb(255, 255, 255)' }}>Already have an account? </span>
                <button
                  onClick={onSwitchToLogin}
                  type="button"
                  className="auth-link"
                  style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', WebkitTextFillColor: 'rgb(255, 255, 255)' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
