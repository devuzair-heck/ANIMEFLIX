import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play, KeyRound, ArrowLeft, Loader2, ShieldCheck, RefreshCw, Mail, Smartphone, AlertCircle, Clock } from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';

interface OtpInputRowProps {
  idPrefix: string;
  label: string;
  icon: React.ReactNode;
  value: string[];
  onChange: (newValue: string[]) => void;
  disabled?: boolean;
}

const OtpInputRow: React.FC<OtpInputRowProps> = ({
  idPrefix,
  label,
  icon,
  value,
  onChange,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const newValue = [...value];

    if (rawVal.length > 0) {
      // Take last character typed
      newValue[index] = rawVal[rawVal.length - 1];
      onChange(newValue);

      // Auto-focus next box
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      newValue[index] = '';
      onChange(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newValue = [...value];
    const digits = pastedData.split('');
    for (let i = 0; i < 6; i++) {
      newValue[i] = digits[i] || '';
    }
    onChange(newValue);

    // Focus box after last filled digit
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">6 Digit Code</span>
      </div>

      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            id={`${idPrefix}-${idx}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={value[idx] || ''}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            placeholder="•"
            aria-label={`${label} digit ${idx + 1}`}
            className="w-8 sm:w-11 h-10 sm:h-12 bg-[#171717] border border-white/10 rounded-xl text-center text-lg sm:text-xl font-black text-white placeholder-neutral-600 focus:outline-none focus:border-[#DC143C] focus:bg-[#202020] transition-all disabled:opacity-40 disabled:cursor-not-allowed selection:bg-[#DC143C]"
          />
        ))}
      </div>
    </div>
  );
};

export const AdminVerifyPage: React.FC = () => {
  const [emailOtp, setEmailOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [smsOtp, setSmsOtp] = useState<string[]>(['', '', '', '', '', '']);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes = 300 seconds
  const [cooldownSeconds, setCooldownSeconds] = useState(0); // 60s cooldown for resend

  const navigate = useNavigate();
  const location = useLocation();
  const challengeId = (location.state as { challengeId?: string })?.challengeId;

  // Expiry countdown effect
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  // Resend cooldown effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const isExpired = expirySeconds === 0;

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const emailCodeStr = emailOtp.join('');
  const smsCodeStr = smsOtp.join('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || isExpired) return;

    setErrorMessage(null);
    setInfoMessage(null);

    if (emailCodeStr.length < 6 || smsCodeStr.length < 6) {
      setErrorMessage('Please enter complete 6-digit codes for both Email and SMS verification.');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await adminAuthService.verifyOtp({
        challengeId,
        emailOtp: emailCodeStr,
        smsOtp: smsCodeStr,
      });

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(result.error || 'Invalid verification codes.');
      }
    } catch {
      setErrorMessage('Verification failed. Please check your network connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCodes = async () => {
    if (cooldownSeconds > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await adminAuthService.resendOtp(challengeId);
      if (result.success) {
        // Reset inputs, expiry timer (5 mins) and cooldown (60s)
        setEmailOtp(['', '', '', '', '', '']);
        setSmsOtp(['', '', '', '', '', '']);
        setExpirySeconds(300);
        setCooldownSeconds(60);
        setInfoMessage(result.message || 'New 2FA verification codes sent to your registered email and phone number.');
      } else {
        setErrorMessage(result.error || 'Failed to resend verification codes.');
      }
    } catch {
      setErrorMessage('Unable to request new codes. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#DC143C] selection:text-white">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#DC143C]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#DC143C] flex items-center justify-center shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
            ANIME<span className="text-[#DC143C]">FLIX</span>
            <span className="text-xs font-bold text-neutral-400 not-italic uppercase ml-2 tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded">
              VERIFY
            </span>
          </span>
        </Link>

        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Login</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="relative z-10 my-auto w-full max-w-lg mx-auto px-4 py-8">
        <div className="bg-[#111111]/90 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#DC143C]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Badge & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#DC143C]/20 border border-[#DC143C]/40 flex items-center justify-center text-[#DC143C] mx-auto mb-4 shadow-xl">
              <KeyRound className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white italic">
              Admin Verification
            </h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-sm mx-auto">
              Verify your identity to access the AnimeFlix Admin Dashboard.
            </p>
          </div>

          {/* Code Expiry Status Bar */}
          <div className="mb-6 bg-[#171717] border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-bold">
              <Clock className="w-4 h-4 text-[#DC143C]" />
              <span>Status:</span>
            </div>

            {isExpired ? (
              <span className="text-red-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Verification code expired.
              </span>
            ) : (
              <span className="text-neutral-300 font-bold">
                Code expires in{' '}
                <span className="text-[#DC143C] font-mono font-black text-sm">{formatTime(expirySeconds)}</span>
              </span>
            )}
          </div>

          {/* Info Alert Banner */}
          {infoMessage && (
            <div className="mb-6 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs font-bold text-center animate-in fade-in duration-200">
              {infoMessage}
            </div>
          )}

          {/* Error Alert Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 bg-red-950/60 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6" noValidate>
            
            {/* EMAIL VERIFICATION */}
            <OtpInputRow
              idPrefix="email-otp"
              label="EMAIL VERIFICATION"
              icon={<Mail className="w-3.5 h-3.5 text-[#DC143C]" />}
              value={emailOtp}
              onChange={setEmailOtp}
              disabled={isVerifying || isExpired}
            />

            {/* SMS VERIFICATION */}
            <OtpInputRow
              idPrefix="sms-otp"
              label="SMS VERIFICATION"
              icon={<Smartphone className="w-3.5 h-3.5 text-[#DC143C]" />}
              value={smsOtp}
              onChange={setSmsOtp}
              disabled={isVerifying || isExpired}
            />

            {/* Action Buttons */}
            {isExpired ? (
              <button
                type="button"
                onClick={handleResendCodes}
                disabled={isResending}
                className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-950/60 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Requesting Codes...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Request New Codes</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isVerifying || emailCodeStr.length < 6 || smsCodeStr.length < 6}
                className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Codes...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFY & CONTINUE</span>
                  </>
                )}
              </button>
            )}

          </form>

          {/* Resend Cooldown Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <button
              type="button"
              onClick={handleResendCodes}
              disabled={cooldownSeconds > 0 || isResending}
              className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {cooldownSeconds > 0 ? (
                <span>Resend available in {cooldownSeconds}s</span>
              ) : (
                <span>Resend Codes</span>
              )}
            </button>

            <Link to="/admin/login" className="hover:text-white transition-colors font-bold uppercase tracking-wider">
              Change Account
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 border-t border-white/5 text-center text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} ANIMEFLIX ADMIN PORTAL • ALL RIGHTS RESERVED</p>
      </footer>

    </div>
  );
};
