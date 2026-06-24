import { ShieldPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', showText = true, light = false }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };
  const textColor = light ? 'text-white' : 'text-gray-900';
  const subColor = light ? 'text-blue-200' : 'text-gray-500';

  return (
    <Link to="/" className="flex items-center gap-3">
      <div className={`flex ${sizes[size]} items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft`}>
        <ShieldPlus className="h-5 w-5" />
      </div>
      {showText && (
        <div>
          <p className={`text-sm font-bold leading-tight ${textColor}`}>Smart Healthcare</p>
          <p className={`text-xs ${subColor}`}>Management System</p>
        </div>
      )}
    </Link>
  );
}
