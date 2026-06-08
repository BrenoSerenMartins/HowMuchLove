import { useContext } from 'react';
import { NavigationContext } from '../providers/NavigationProvider';

export const useNavigate = () => {
  return useContext(NavigationContext);
};
