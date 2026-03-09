import React, { type ReactNode } from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-premium">
      <div className="max-w-4xl mx-auto glass p-6 sm:p-10 rounded-3xl shadow-premium">
        {children}
      </div>
    </div>
  );
};
