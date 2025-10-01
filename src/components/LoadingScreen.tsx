import { useEffect, useState } from "react";
import { Recycle } from "lucide-react";
import aretLogo from "@/assets/aret-logo.png";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadingComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-primary flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-4">
          <img 
            src={aretLogo} 
            alt="ARET Logo" 
            className="h-16 w-auto animate-pulse"
          />
          <Recycle 
            size={48} 
            className="text-primary-foreground animate-spin" 
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary-foreground">
            ARET Environmental Services
          </h2>
          <p className="text-primary-foreground/80">
            Loading sustainable solutions...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-primary-foreground/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary-foreground h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-primary-foreground/60 text-sm mt-2">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;