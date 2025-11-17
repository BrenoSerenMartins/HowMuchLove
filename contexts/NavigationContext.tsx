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

const getRouteFromHash = () => {
    const hash = window.location.hash.substring(1);
    // Handle paths that might include their own hash for scrolling (e.g., /settings#pricing)
    return hash.split('#')[0] || '/';
};

export const NavigationContext = createContext<NavigationContextType>({
    route: getRouteFromHash(),
    navigate: () => {},
    setIsDirty: () => {},
    isConfirmationModalOpen: false,
    confirmNavigation: () => {},
    cancelNavigation: () => {},
    isPreviewMode: false, // Default value
    setPreviewMode: () => {}, // Default function
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [route, setRoute] = useState(getRouteFromHash());
    const [isDirty, setIsDirty] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, pendingPath: '' });
    const [isPreviewMode, setPreviewMode] = useState(false); // New state

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(getRouteFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = useCallback((path: string) => {
        const currentRoute = getRouteFromHash();
        if (currentRoute === path) return;

        if (isDirty) {
            setModalState({ isOpen: true, pendingPath: path });
        } else {
            window.location.hash = path;
        }
    }, [isDirty]);

    const confirmNavigation = () => {
        setIsDirty(false);
        const path = modalState.pendingPath;
        setModalState({ isOpen: false, pendingPath: '' });
        window.location.hash = path;
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