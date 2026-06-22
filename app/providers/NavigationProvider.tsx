import React, { createContext, useState, useEffect, useCallback } from 'react';

interface NavigationContextType {
    route: string;
    navigate: (path: string) => void;
    setIsDirty: (dirty: boolean) => void;
    isConfirmationModalOpen: boolean;
    confirmNavigation: () => void;
    cancelNavigation: () => void;
    isPreviewMode: boolean; // New state
    setPreviewMode: (mode: boolean) => void; // New function
}

const getRouteFromPath = () => {
    return window.location.pathname + window.location.search || '/';
};

export const NavigationContext = createContext<NavigationContextType>({
    route: getRouteFromPath(),
    navigate: () => {},
    setIsDirty: () => {},
    isConfirmationModalOpen: false,
    confirmNavigation: () => {},
    cancelNavigation: () => {},
    isPreviewMode: false, // Default value
    setPreviewMode: () => {}, // Default function
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [route, setRoute] = useState(getRouteFromPath());
    const [isDirty, setIsDirty] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, pendingPath: '' });
    const [isPreviewMode, setPreviewMode] = useState(false); // New state

    useEffect(() => {
        const handlePopState = () => {
            setRoute(getRouteFromPath());
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = useCallback((path: string) => {
        const targetRoute = path.split('#')[0] || '/';
        const currentRoute = getRouteFromPath();
        
        const pathHash = path.includes('#') ? '#' + path.split('#')[1] : '';
        if (currentRoute === targetRoute && window.location.hash === pathHash) return;

        if (isDirty) {
            setModalState({ isOpen: true, pendingPath: path });
        } else {
            window.history.pushState(null, '', path);
            setRoute(targetRoute);
            
            if (pathHash) {
                setTimeout(() => {
                    const id = pathHash.substring(1);
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                window.scrollTo(0, 0);
            }
        }
    }, [isDirty]);

    const confirmNavigation = () => {
        setIsDirty(false);
        const path = modalState.pendingPath;
        setModalState({ isOpen: false, pendingPath: '' });
        
        const targetRoute = path.split('#')[0] || '/';
        const pathHash = path.includes('#') ? '#' + path.split('#')[1] : '';
        
        window.history.pushState(null, '', path);
        setRoute(targetRoute);
        
        if (pathHash) {
            setTimeout(() => {
                const id = pathHash.substring(1);
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    };

    const cancelNavigation = () => {
        setModalState({ isOpen: false, pendingPath: '' });
    };

    const value = {
        route,
        navigate,
        setIsDirty,
        isConfirmationModalOpen: modalState.isOpen,
        confirmNavigation,
        cancelNavigation,
        isPreviewMode, // Include new state
        setPreviewMode, // Include new function
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};