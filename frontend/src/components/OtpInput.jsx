/**
 * OTP Input Component
 * -------------------
 * Reusable 6-digit OTP input for registration, login, and password reset.
 * Only shown when OTP_ENABLED=true on the backend.
 */
export default function OtpInput({ value, onChange, length = 6 }) {
  const digits = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = (index, char) => {
    if (!/^\d?$/.test(char)) return;
    const arr = digits.slice();
    arr[index] = char;
    onChange(arr.join('').trim());

    if (char && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-10 rounded-lg border border-gray-200 text-center text-lg font-bold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      ))}
    </div>
  );
}
