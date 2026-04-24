import React from 'react';
import { ShieldCheck, Zap, WifiOff } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6 transition-colors duration-300">
            Private File Conversion <br />
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
              Directly on Your Device
            </span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Convert, compress, and manage your files without ever uploading them to a server. 
            Secure, fast, and works 100% offline.
          </p>
          
          <div className="mt-10 flex justify-center gap-8 text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>100% Client-Side</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <span>Works Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;