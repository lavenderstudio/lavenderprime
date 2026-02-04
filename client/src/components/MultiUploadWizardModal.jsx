/* eslint-disable react-hooks/static-components */
// client/src/components/MultiUploadWizardModal.jsx
// ----------------------------------------------------
// Bulk upload wizard:
// 1) Select multiple files
// 2) Review list
// 3) Upload all to Cloudinary
// 4) Return array of { originalUrl, fileMeta }
// ----------------------------------------------------

import { useState } from "react";
import { uploadToCloudinary } from "../lib/cloudinaryUpload.js";

export default function MultiUploadWizardModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of File objects
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Create local previews
      const newFiles = files.map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        status: 'pending' // pending, uploading, done, error
      }));
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setStep(2);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
    if (selectedFiles.length <= 1) setStep(1);
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setError("");
    setProgress({ current: 0, total: selectedFiles.length });

    const results = [];
    let successCount = 0;

    // Upload sequentially to avoid overwhelming browser/network (or limit concurrency)
    // For simplicity, sequential or small batches.
    for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        
        // Update status to uploading
        setSelectedFiles(prev => {
            const next = [...prev];
            next[i].status = 'uploading';
            return next;
        });

        try {
            const uploaded = await uploadToCloudinary({ file: item.file });
            results.push({
                originalUrl: uploaded.url,
                fileMeta: uploaded,
                transform: { 
                    ratio: "original", 
                    ratioW: uploaded.width, 
                    ratioH: uploaded.height 
                } // Default transform
            });
            
            setSelectedFiles(prev => {
                const next = [...prev];
                next[i].status = 'done';
                return next;
            });
            successCount++;
        } catch (err) {
            console.error("Upload failed for file", item.file.name, err);
            setSelectedFiles(prev => {
                const next = [...prev];
                next[i].status = 'error';
                return next;
            });
        }
        
        setProgress({ current: i + 1, total: selectedFiles.length });
    }

    setUploading(false);

    if (successCount > 0) {
        onComplete(results);
        handleClose();
    } else {
        setError("All uploads failed. Please try again.");
    }
  };

  const handleClose = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setStep(1);
    setUploading(false);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button type="button" onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Close" />

      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-extrabold text-slate-900">
            {step === 1 ? "Upload Photos" : `Review (${selectedFiles.length})`}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 font-semibold border border-red-100">
                  {error}
              </div>
            )}

            {step === 1 && (
                <div className="h-64 border-2 border-dashed border-slate-300 rounded-3xl bg-white flex flex-col items-center justify-center p-6 text-center hover:border-[#FF633F] transition group cursor-pointer relative">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="h-16 w-16 bg-[#FF633F]/10 text-[#FF633F] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-900">Click to Select Photos</p>
                    <p className="text-sm text-slate-500 mt-1">or drag and drop multiple images here</p>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Add more button */}
                    <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center text-slate-400 hover:border-[#FF633F] hover:text-[#FF633F] transition cursor-pointer relative">
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileSelect} 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                         <span className="text-4xl">+</span>
                         <span className="text-xs font-bold mt-1">Add More</span>
                    </div>

                    {selectedFiles.map((item, idx) => (
                        <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 group">
                             <img src={item.preview} className="w-full h-full object-cover" alt="" />
                             
                             {/* Overlay Status */}
                             {uploading && (
                                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                     {item.status === 'uploading' && (
                                         <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                     )}
                                     {item.status === 'done' && <span className="text-white text-xl">✅</span>}
                                      {item.status === 'error' && <span className="text-white text-xl">❌</span>}
                                 </div>
                             )}

                             {/* Remove Button (only when not uploading) */}
                             {!uploading && (
                                 <button 
                                    onClick={() => removeFile(idx)}
                                    className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full hover:bg-white transition opacity-0 group-hover:opacity-100"
                                >
                                    ✕
                                 </button>
                             )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer */}
        {step === 2 && (
            <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-slate-600">
                    {uploading ? (
                         <span>Uploading {progress.current} / {progress.total} ...</span>
                    ) : (
                        <span>{selectedFiles.length} photos selected</span>
                    )}
                </div>
                
                <div className="flex gap-3">
                     <button
                        onClick={handleClose}
                        disabled={uploading}
                        className="px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUploadAll}
                        disabled={uploading}
                        className="px-8 py-3 rounded-2xl bg-[#FF633F] hover:bg-[#FF4C1A] text-white font-bold shadow-lg shadow-[#FF633F]/20 active:scale-95 transition disabled:opacity-50 disabled:scale-100"
                    >
                        {uploading ? "Uploading..." : "Upload All"}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
