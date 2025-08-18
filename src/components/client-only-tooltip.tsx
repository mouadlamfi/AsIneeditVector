"use client";

import React from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

export default ClientOnly;