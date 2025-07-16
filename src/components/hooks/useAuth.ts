import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useAuth = () => {
  const { token, tokenExpiration, user } = useSelector((state: RootState) => state.auth);

  // Check if token exists and is not expired
  const isTokenValid = () => {
    if (!token || !tokenExpiration) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime < tokenExpiration;
  };

  // Get remaining time in seconds
  const getTokenRemainingTime = () => {
    if (!tokenExpiration) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = tokenExpiration - currentTime;
    return Math.max(0, remainingTime);
  };

  // Check if token will expire soon (within 5 minutes)
  const isTokenExpiringSoon = () => {
    const remainingTime = getTokenRemainingTime();
    return remainingTime > 0 && remainingTime <= 300; // 5 minutes
  };

  return {
    isAuthenticated: isTokenValid(),
    token,
    user,
    tokenExpiration,
    isTokenExpiringSoon: isTokenExpiringSoon(),
    tokenRemainingTime: getTokenRemainingTime(),
  };
};