export class ValidationEngine {
  static validateName(input: string): { valid: boolean; error?: string } {
    if (!input || input.trim().length < 2) {
      return {
        valid: false,
        error: "Please provide your full name (at least 2 characters)."
      };
    }
    return { valid: true };
  }

  static validateEmail(input: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.trim())) {
      return {
        valid: false,
        error: "Please provide a valid email address (e.g., name@example.com)"
      };
    }
    return { valid: true };
  }

  static validatePhone(input: string): { valid: boolean; error?: string } {
    const cleanedPhone = input.replace(/\s+/g, '');
    const nigerianPhoneRegex = /^(\+234|234|0)[7-9][0-1]\d{8}$/;

    if (!nigerianPhoneRegex.test(cleanedPhone)) {
      return {
        valid: false,
        error: "Please provide a valid Nigerian phone number (e.g., 09152870616 or +2349152870616)"
      };
    }
    return { valid: true };
  }

  static validateChoice(
    input: string,
    options: string[]
  ): { valid: boolean; error?: string; normalized?: string } {
    const normalizedInput = input.trim().toLowerCase();

    const numberMatch = normalizedInput.match(/^(\d+)/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1]) - 1;
      if (index >= 0 && index < options.length) {
        return { valid: true, normalized: options[index] };
      }
    }

    const matchedOption = options.find(
      option => option.toLowerCase() === normalizedInput
    );

    if (matchedOption) {
      return { valid: true, normalized: matchedOption };
    }

    return {
      valid: false,
      error: `Please choose a valid option (1-${options.length}) or type the option name.`
    };
  }

  static normalizePhone(input: string): string {
    let cleaned = input.replace(/\s+/g, '');

    if (cleaned.startsWith('+234')) {
      return cleaned;
    } else if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    }

    return cleaned;
  }
}