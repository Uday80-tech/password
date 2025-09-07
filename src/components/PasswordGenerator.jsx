import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { generatePassword, calculatePasswordStrength } from '../utils/passwordGenerator';
import { logPasswordGeneration } from '../firebase/firestore';
import { auth } from '../firebase/config';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    useLower: true,
    useUpper: true,
    useNumber: true,
    useSymbol: false
  });
  const [keyword, setKeyword] = useState('');
  const [strength, setStrength] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Refs for GSAP animations
  const generateButtonRef = useRef();
  const strengthMeterRef = useRef();
  const passwordDisplayRef = useRef();

  // Generate initial password
  useEffect(() => {
    generateNewPassword();
  }, []);

  // Update strength when password or options change
  useEffect(() => {
    if (password) {
      const strengthData = calculatePasswordStrength(password, options, keyword);
      setStrength(strengthData);
      
      // Animate strength meter
      if (strengthMeterRef.current) {
        gsap.to(strengthMeterRef.current, {
          width: `${(strengthData.score / 50) * 100}%`,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    }
  }, [password, options, keyword]);

  const generateNewPassword = async () => {
    setIsGenerating(true);
    
    // Animate generate button
    if (generateButtonRef.current) {
      gsap.to(generateButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }

    try {
      const newPassword = generatePassword({ length, ...options, keyword });
      setPassword(newPassword);
      
      // Animate password display
      if (passwordDisplayRef.current) {
        gsap.fromTo(passwordDisplayRef.current, 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }

      // Log to Firebase (only metadata, never the password)
      if (auth.currentUser) {
        const strengthData = calculatePasswordStrength(newPassword, options, keyword);
        await logPasswordGeneration({
          uid: auth.currentUser.uid,
          length,
          options,
          strengthScore: strengthData.score
        });
      }
    } catch (error) {
      console.error('Error generating password:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      
      // Animate copy feedback
      gsap.to(passwordDisplayRef.current, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const getStrengthColor = (color) => {
    const colors = {
      danger: 'bg-danger-500',
      warning: 'bg-warning-500',
      success: 'bg-success-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="glass-effect rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Password Generator
          </h1>
          <p className="text-white/70">
            Generate secure passwords with customizable options
          </p>
        </div>

        {/* Password Display */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white/80">
            Generated Password
          </label>
          <div className="relative">
            <input
              ref={passwordDisplayRef}
              type="text"
              value={password}
              readOnly
              className="input-field w-full pr-20 text-lg font-mono"
              placeholder="Your password will appear here..."
            />
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 button-secondary text-sm"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* Keyword Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white/80">
            Keyword (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input-field w-full pr-12"
              placeholder="Enter a keyword to include in your password..."
              maxLength={20}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
              {keyword.length}/20
            </span>
          </div>
          <p className="text-xs text-white/60 mt-2">
            💡 Your keyword will be incorporated into the password for better memorability
          </p>
        </div>

        {/* Password Strength */}
        {strength && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">
                Password Strength
              </span>
              <span className="text-sm font-semibold">
                {strength.emoji} {strength.strength} ({strength.score}/50)
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                ref={strengthMeterRef}
                className={`h-full transition-all duration-500 ${getStrengthColor(strength.color)}`}
                style={{ width: '0%' }}
              />
            </div>
            {keyword && strength.analysis.hasKeyword && (
              <p className="text-xs text-success-300 mt-2 flex items-center">
                <span className="mr-1">✅</span>
                Keyword "{keyword}" successfully incorporated
              </p>
            )}
          </div>
        )}

        {/* Length Control */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white/80">
            Password Length: {length}
          </label>
          <input
            type="range"
            min="4"
            max="128"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Character Options */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-4 text-white/80">
            Character Types
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'useLower', label: 'Lowercase (a-z)', icon: '🔤' },
              { key: 'useUpper', label: 'Uppercase (A-Z)', icon: '🔠' },
              { key: 'useNumber', label: 'Numbers (0-9)', icon: '🔢' },
              { key: 'useSymbol', label: 'Symbols (!@#)', icon: '🔣' }
            ].map(({ key, label, icon }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => handleOptionChange(key)}
                  className="checkbox-custom"
                />
                <span className="text-white/90">
                  {icon} {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            ref={generateButtonRef}
            onClick={generateNewPassword}
            disabled={isGenerating || Object.values(options).every(v => !v)}
            className="button-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              '🎲 Generate New Password'
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-success-400 text-xl">🔒</span>
            <div className="text-sm text-success-200">
              <p className="font-semibold mb-1">Security Notice</p>
              <p>Your passwords are never stored or logged. Only generation metadata (length, options, strength) is anonymously logged for analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
