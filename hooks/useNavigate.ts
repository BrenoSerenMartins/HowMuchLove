import { useContext } from 'react';
import { NavigationContext } from '../contexts/NavigationContext';

export const useNavigate = () => {
  return useContext(NavigationContext);
};
