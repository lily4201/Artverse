"use client";

import React from 'react';

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onChange }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  };

  return (
    <div>
      <label>{label}</label>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}; 