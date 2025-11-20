import React, { useEffect, useRef } from 'react';

interface MathDisplayProps {
  formula?: string; // Use this for block equations (auto wrapped in $$)
  text?: string;    // Use this for mixed text/inline math (e.g. "Value is $\rho$")
  className?: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ formula, text, className = "" }) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.MathJax && nodeRef.current) {
      // Queue the typeset command to MathJax for this specific node
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, nodeRef.current]);
    }
  }, [formula, text]);

  return (
    <div ref={nodeRef} className={`math-display ${className}`}>
      {text ? (
        // Render raw text which contains $...$ delimiters
        <span>{text}</span>
      ) : (
        // Render block formula wrapped in $$
        `$$${formula}$$`
      )}
    </div>
  );
};

declare global {
  interface Window {
    MathJax: any;
  }
}

export default MathDisplay;