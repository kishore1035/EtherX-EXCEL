import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import emailjs from '@emailjs/browser';
import logoImage from "../assets/Logo.png";
import { Icon3D } from "./ui/Icon3D";

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onOtpVerified: (email: string) => void;
}

export function ForgotPasswordPage({ onBackToLogin, onOtpVerified }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize EmailJS
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Check if account exists
    const storedPassword = localStorage.getItem(`user_password_${email}`);
    if (!storedPassword) {
      toast.error("No account found with this email address");
      return;
    }

    setIsLoading(true);

    // Generate OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    // Send OTP via EmailJS
    try {
      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        otp_code: newOtp,
        from_name: 'EtherX Excel',
        message: 'Use this OTP to reset your password. This OTP is valid for 10 minutes.',
      };

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      await emailjs.send(serviceId, templateId, templateParams);
      
      toast.success("OTP sent to your email!");
      setShowOtpScreen(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp === generatedOtp) {
      toast.success("OTP verified successfully!");
      onOtpVerified(email);
    } else {
      toast.error("Invalid OTP. Please try again.");
      setOtp("");
    }
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
              {showOtpScreen ? 'Verify OTP' : 'Forgot Password'}
            </h1>
            <p className="auth-subtitle">
              {showOtpScreen ? 'Enter the OTP sent to your email' : 'Enter your email to reset password'}
            </p>
          </div>

          {!showOtpScreen ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="relative">
                  <img src="/icons/3d/mail.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7 }} />
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
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
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <div className="auth-links">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="auth-link"
                  style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', WebkitTextFillColor: 'rgb(255, 255, 255)' }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
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
                    maxLength={6}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Verify OTP
              </button>

              <div className="auth-links" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                  className="auth-link"
                  style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', WebkitTextFillColor: 'rgb(255, 255, 255)' }}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="auth-link"
                  style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', WebkitTextFillColor: 'rgb(255, 255, 255)' }}
                >
                  ← Back to Login
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
