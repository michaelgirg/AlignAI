import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const DocumentUpload = ({
  onFileUpload,
  onTextUpload,
  acceptedTypes,
  placeholder,
  showTextInput,
  setShowTextInput,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`Invalid file type. Please upload: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size (6MB for resume, 3MB for JD)
    const maxSize = acceptedTypes.includes('.pdf') ? 6 * 1024 * 1024 : 3 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      alert(`File too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      try {
        await onFileUpload(selectedFile);
        setSelectedFile(null);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const handleTextUpload = async () => {
    if (textInput.trim()) {
      try {
        await onTextUpload(textInput.trim());
        setTextInput('');
        setShowTextInput(false);
      } catch (error) {
        console.error('Text upload failed:', error);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleTextInput = () => {
    setShowTextInput(!showTextInput);
    if (showTextInput) {
      setTextInput('');
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        {!selectedFile ? (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your file here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {placeholder}
            </p>
            <p className="text-xs text-gray-400">
              Accepted formats: {acceptedTypes.join(', ')}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* File Upload Button */}
      {selectedFile && (
        <button
          onClick={handleFileUpload}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Upload File
        </button>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Text Input Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={toggleTextInput}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {showTextInput ? 'Hide' : 'Paste'} text instead
        </button>
      </div>

      {/* Text Input Area */}
      {showTextInput && (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your text here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleTextUpload}
            disabled={!textInput.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              textInput.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Text
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
