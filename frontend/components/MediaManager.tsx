'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, 
  FaTrash, 
  FaCrop, 
  FaEye, 
  FaDownload,
  FaImages,
  FaVideo,
  FaSpinner,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
}

interface MediaManagerProps {
  carId?: string;
  onMediaUpdate?: (media: MediaFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

export default function MediaManager({ 
  carId, 
  onMediaUpdate, 
  maxFiles = 20, 
  allowedTypes = ['image/*', 'video/*'] 
}: MediaManagerProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setMediaFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    uploadFiles(newFiles);
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: maxFiles - mediaFiles.length,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const uploadFiles = async (files: MediaFile[]) => {
    setUploading(true);

    for (const file of files) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setMediaFiles(prev => 
            prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            )
          );
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Mock API upload
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('carId', carId || '');
        
        // In production, replace with actual upload API
        const mockUploadResponse = {
          success: true,
          url: `https://cdn.example.com/cars/${carId}/${file.id}.${file.file.name.split('.').pop()}`
        };

        setMediaFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', url: mockUploadResponse.url }
              : f
          )
        );

      } catch (error) {
        console.error('Upload failed:', error);
        setMediaFiles(prev => 
          prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' } : f
          )
        );
      }
    }

    setUploading(false);
    if (onMediaUpdate) {
      onMediaUpdate(mediaFiles);
    }
  };

  const deleteFile = (fileId: string) => {
    setMediaFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      if (onMediaUpdate) onMediaUpdate(updated);
      return updated;
    });
  };

  const reorderFiles = (fromIndex: number, toIndex: number) => {
    setMediaFiles(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      if (onMediaUpdate) onMediaUpdate(updated);
      return updated;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop images or videos here, or <span className="text-blue-600 font-medium">browse files</span>
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WebP, MP4, MOV up to 50MB each. Max {maxFiles} files.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {mediaFiles.length} / {maxFiles} files uploaded
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaSpinner className="w-5 h-5 text-blue-600 animate-spin mr-3" />
            <span className="text-blue-800 font-medium">Uploading files...</span>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {mediaFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploaded Media ({mediaFiles.length})
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Select All
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                Delete Selected
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaFiles.map((file, index) => (
              <div 
                key={file.id} 
                className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  reorderFiles(fromIndex, index);
                }}
              >
                {/* Media Preview */}
                <div className="aspect-square relative">
                  {file.type === 'image' ? (
                    <img 
                      src={file.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FaVideo className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2">
                    {getStatusIcon(file.status)}
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50">
                      <div 
                        className="h-1 bg-blue-500 transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => setSelectedFile(file)}
                          className="p-1 bg-white rounded shadow text-gray-700 hover:text-blue-600"
                          title="Preview"
                        >
                          <FaEye className="w-3 h-3" />
                        </button>
                        
                        {file.type === 'image' && (
                          <button 
                            className="p-1 bg-white rounded shadow text-gray-700 hover:text-green-600"
                            title="Crop"
                          >
                            <FaCrop className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deleteFile(file.id)}
                          className="p-1 bg-white rounded shadow text-gray-700 hover:text-red-600"
                          title="Delete"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-2">
                  <div className="text-xs text-gray-600 truncate">
                    {file.file.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                  {index === 0 && (
                    <div className="text-xs text-blue-600 font-medium">Primary</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedFile.file.name}</h3>
                <button 
                  type="button"
                  title="Close preview"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                {selectedFile.type === 'image' ? (
                  <img 
                    src={selectedFile.preview} 
                    alt="Preview" 
                    className="max-w-full max-h-96 mx-auto"
                  />
                ) : (
                  <video 
                    src={selectedFile.preview} 
                    controls 
                    className="max-w-full max-h-96 mx-auto"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                {selectedFile.url && (
                  <a 
                    href={selectedFile.url} 
                    download 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Download
                  </a>
                )}
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {mediaFiles.length > 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Bulk Actions</h4>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center">
              <FaImages className="w-4 h-4 mr-2" />
              Optimize All Images
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center">
              <FaDownload className="w-4 h-4 mr-2" />
              Download All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}