import React from 'react';
import { ChevronUp, Star, Shield, Award, Medal, Crown } from 'lucide-react';

interface RankIconProps {
  rank: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export const getRankConfig = (rank: string) => {
  if (rank.includes('Đại tướng')) return { color: 'text-cyan-400', bg: 'bg-cyan-50', border: 'border-cyan-200', stars: 4, icon: Crown, label: 'Kim cương' };
  if (rank.includes('Thượng tướng')) return { color: 'text-cyan-400', bg: 'bg-cyan-50', border: 'border-cyan-200', stars: 3, icon: Crown, label: 'Kim cương' };
  if (rank.includes('Trung tướng')) return { color: 'text-cyan-400', bg: 'bg-cyan-50', border: 'border-cyan-200', stars: 2, icon: Crown, label: 'Kim cương' };
  if (rank.includes('Thiếu tướng')) return { color: 'text-cyan-400', bg: 'bg-cyan-50', border: 'border-cyan-200', stars: 1, icon: Crown, label: 'Kim cương' };
  
  if (rank.includes('Đại tá')) return { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', stars: 4, icon: Medal, label: 'Vàng' };
  if (rank.includes('Thượng tá')) return { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', stars: 3, icon: Medal, label: 'Vàng' };
  if (rank.includes('Trung tá')) return { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', stars: 2, icon: Medal, label: 'Vàng' };
  if (rank.includes('Thiếu tá')) return { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', stars: 1, icon: Medal, label: 'Vàng' };

  if (rank.includes('Đại úy')) return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', stars: 4, icon: Award, label: 'Bạc' };
  if (rank.includes('Thượng úy')) return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', stars: 3, icon: Award, label: 'Bạc' };
  if (rank.includes('Trung úy')) return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', stars: 2, icon: Award, label: 'Bạc' };
  if (rank.includes('Thiếu úy')) return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', stars: 1, icon: Award, label: 'Bạc' };

  if (rank.includes('Thượng sĩ')) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', stars: 3, icon: Shield, label: 'HSQ' };
  if (rank.includes('Trung sĩ')) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', stars: 2, icon: Shield, label: 'HSQ' };
  if (rank.includes('Hạ sĩ')) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', stars: 1, icon: Shield, label: 'HSQ' };
  
  if (rank.includes('Binh nhất')) return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', stars: 2, icon: ChevronUp, label: 'Đồng' };
  if (rank.includes('Binh nhì')) return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', stars: 1, icon: ChevronUp, label: 'Đồng' };

  return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', stars: 0, icon: Shield, label: 'QN' };
};

export const RankIcon: React.FC<RankIconProps> = ({ rank, size = 16, className = "" }) => {
  const config = getRankConfig(rank);
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Icon size={size} className={config.color} />
      {config.stars > 0 && (
        <div className="flex -space-x-0.5 mt-0.5">
          {Array.from({ length: config.stars }).map((_, i) => (
            <Star key={i} size={size * 0.5} fill="currentColor" className={config.color} />
          ))}
        </div>
      )}
    </div>
  );
};

interface RankAvatarProps {
  rank: string;
  initials: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  children?: React.ReactNode;
}

export const RankAvatar: React.FC<RankAvatarProps> = ({ rank, initials, avatarUrl, size = 'md', status, children }) => {
  const config = getRankConfig(rank);
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-28 h-28 text-4xl'
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 -bottom-0.5 -right-0.5',
    md: 'w-6 h-6 -bottom-0.5 -right-0.5',
    lg: 'w-8 h-8 -bottom-1 -right-1',
    xl: 'w-10 h-10 -bottom-1.5 -right-1.5'
  };

  const starSize = {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12
  };

  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      {/* Main Avatar Circle */}
      <div className={`${sizeClasses[size]} rounded-[35%] army-shadow flex items-center justify-center font-black border-2 ${config.border} ${config.bg} ${config.color} transition-transform hover:scale-105 overflow-hidden`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={initials} className="w-full h-full object-cover scale-105" referrerPolicy="no-referrer" />
        ) : (
          <span>{initials}</span>
        )}
        {children}
      </div>

      {/* Rank Badge Overlay */}
      <div className={`absolute ${badgeSizeClasses[size]} ${config.bg} ${config.border} border-2 rounded-xl shadow-lg flex flex-col items-center justify-center z-10`}>
        <Icon size={size === 'xl' ? 18 : size === 'lg' ? 14 : 10} className={config.color} />
        {config.stars > 0 && (
          <div className="flex -space-x-0.5 -mt-0.5">
            {Array.from({ length: config.stars }).map((_, i) => (
              <Star key={i} size={starSize[size]} fill="currentColor" className={config.color} />
            ))}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <div className={`absolute top-0 -right-1 w-3 h-3 rounded-full border-2 border-white ${status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-orange-500' : 'bg-gray-300'}`} />
      )}
    </div>
  );
};
