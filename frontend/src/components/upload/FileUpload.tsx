"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn, formatFileSize, getFileExtension, ALLOWED_MODEL_FORMATS, MAX_FILE_SIZE } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FileUpload({ onFileSelect, isUploading, uploadProgress }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      const ext = `.${getFileExtension(file.name)}`;
      if (!ALLOWED_MODEL_FORMATS.includes(ext)) {
        setError(`Invalid format. Supported: ${ALLOWED_MODEL_FORMATS.join(", ")}`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 100MB limit");
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"],
      "model/gltf+json": [".gltf"],
      "model/gltf-binary": [".glb"],
      "application/octet-stream": [".3mf"],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400 hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        {isDragActive ? (
          <p className="text-brand-600 font-medium">Drop your 3D model here</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">Drag & drop your 3D model file</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Supported: STL, OBJ, GLTF, GLB, 3MF &middot; Max 100MB
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
          </div>
          {isUploading && (
            <div className="w-32">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress || 0}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
