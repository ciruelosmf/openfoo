// src/components/themes/msn/MSNHeader.tsx
import React from 'react';

const MSNHeader: React.FC = () => {
  return (
    <div className="bg-msn-header-gradient text-msn-white p-1 flex items-center justify-between select-none border-b border-msn-blue-dark">
      {/* Left Side: Title */}
      <div className="flex items-center pl-1">
        {/* Placeholder for MSN Icon - could be an img or SVG */}
        <span className="w-4 h-4 bg-msn-green rounded-full mr-2 border border-msn-blue-dark"></span>
        <span className="text-xs font-bold">Chat with AI Assistant</span>
      </div>

      {/* Right Side: Fake Window Controls */}
      <div className="flex space-x-1 pr-1">
        <div className="w-4 h-4 bg-msn-grey-light border border-msn-grey-dark flex items-center justify-center">
          <span className="text-msn-black text-[8px] font-black">_</span> {/* Minimize */}
        </div>
        <div className="w-4 h-4 bg-msn-grey-light border border-msn-grey-dark flex items-center justify-center">
          <span className="w-2 h-2 border border-msn-black"></span> {/* Maximize */}
        </div>
        <div className="w-4 h-4 bg-red-600 border border-msn-grey-dark flex items-center justify-center">
          <span className="text-msn-white text-[8px] font-bold">X</span> {/* Close */}
        </div>
      </div>
    </div>
  );
};

export default MSNHeader;