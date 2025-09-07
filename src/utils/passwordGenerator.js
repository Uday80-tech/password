/**
 * Password generation utilities
 */

// Character sets for password generation
const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Generate a secure password based on the given options
 * @param {Object} options - Password generation options
 * @param {number} options.length - Password length
 * @param {boolean} options.useLower - Include lowercase letters
 * @param {boolean} options.useUpper - Include uppercase letters
 * @param {boolean} options.useNumber - Include numbers
 * @param {boolean} options.useSymbol - Include symbols
 * @param {string} options.keyword - Optional keyword to incorporate
 * @returns {string} Generated password
 */
export const generatePassword = ({ length, useLower, useUpper, useNumber, useSymbol, keyword = '' }) => {
  // Build character set based on options
  let charset = '';
  if (useLower) charset += CHARACTER_SETS.lowercase;
  if (useUpper) charset += CHARACTER_SETS.uppercase;
  if (useNumber) charset += CHARACTER_SETS.numbers;
  if (useSymbol) charset += CHARACTER_SETS.symbols;

  // Ensure at least one character set is selected
  if (!charset) {
    throw new Error('At least one character type must be selected');
  }

  // Process keyword if provided
  let processedKeyword = '';
  if (keyword && keyword.trim()) {
    // Sanitize keyword - remove special characters and limit length
    processedKeyword = keyword.trim().replace(/[^a-zA-Z0-9]/g, '');
    
    // Limit keyword length to not exceed 1/3 of total password length
    const maxKeywordLength = Math.floor(length / 3);
    if (processedKeyword.length > maxKeywordLength) {
      processedKeyword = processedKeyword.substring(0, maxKeywordLength);
    }
  }

  // Generate password ensuring variety
  let password = '';
  const selectedSets = [];
  
  if (useLower) selectedSets.push(CHARACTER_SETS.lowercase);
  if (useUpper) selectedSets.push(CHARACTER_SETS.uppercase);
  if (useNumber) selectedSets.push(CHARACTER_SETS.numbers);
  if (useSymbol) selectedSets.push(CHARACTER_SETS.symbols);

  // Ensure at least one character from each selected set
  selectedSets.forEach(set => {
    const randomChar = set[Math.floor(Math.random() * set.length)];
    password += randomChar;
  });

  // Add processed keyword if provided
  if (processedKeyword) {
    password += processedKeyword;
  }

  // Fill the rest of the password with random characters
  for (let i = password.length; i < length; i++) {
    const randomChar = charset[Math.floor(Math.random() * charset.length)];
    password += randomChar;
  }

  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Calculate password strength score
 * @param {string} password - Password to analyze
 * @param {Object} options - Password generation options
 * @param {string} keyword - Optional keyword used in generation
 * @returns {Object} Strength analysis
 */
export const calculatePasswordStrength = (password, options, keyword = '') => {
  let score = 0;
  const analysis = {
    length: password.length,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    hasRepeats: /(.)\1{2,}/.test(password),
    hasSequences: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password),
    hasKeyword: keyword && password.toLowerCase().includes(keyword.toLowerCase()),
    keywordLength: keyword ? keyword.length : 0
  };

  // Length scoring
  if (analysis.length >= 8) score += 5;
  if (analysis.length >= 12) score += 5;
  if (analysis.length >= 16) score += 5;
  if (analysis.length >= 20) score += 5;

  // Character variety scoring
  if (analysis.hasLower) score += 2;
  if (analysis.hasUpper) score += 2;
  if (analysis.hasNumber) score += 2;
  if (analysis.hasSymbol) score += 3;

  // Keyword scoring (bonus for using keyword, but not too much)
  if (analysis.hasKeyword) {
    score += Math.min(3, analysis.keywordLength); // Max 3 points for keyword
  }

  // Penalties
  if (analysis.hasRepeats) score -= 3;
  if (analysis.hasSequences) score -= 2;
  if (analysis.length < 8) score -= 10;

  // Ensure score is within bounds
  score = Math.max(0, Math.min(50, score));

  // Determine strength level
  let strength, emoji, color;
  if (score < 10) {
    strength = 'Very Weak';
    emoji = '🔴';
    color = 'danger';
  } else if (score < 20) {
    strength = 'Weak';
    emoji = '🟠';
    color = 'warning';
  } else if (score < 30) {
    strength = 'Fair';
    emoji = '🟡';
    color = 'warning';
  } else if (score < 40) {
    strength = 'Good';
    emoji = '🟢';
    color = 'success';
  } else {
    strength = 'Strong';
    emoji = '🟢';
    color = 'success';
  }

  return {
    score,
    strength,
    emoji,
    color,
    analysis
  };
};
