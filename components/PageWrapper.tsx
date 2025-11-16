import React from 'react';

// Simple fade-in animation using a custom keyframe
const style = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <style>{style}</style>
      <div className="animate-fadeIn">
        {children}
      </div>
    </>
  );
};

export default PageWrapper;