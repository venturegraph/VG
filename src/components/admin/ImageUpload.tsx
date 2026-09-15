'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Validate file type & size (max 8MB)
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB limit. Please upload a smaller file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
      const filePath = `posts/${Date.now()}-${cleanFileName}.${fileExt}`;

      // Upload to Supabase Storage bucket: post-images
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Provide friendly message if bucket doesn't exist
        if (
          uploadError.message.toLowerCase().includes('bucket not found') ||
          uploadError.message.toLowerCase().includes('bucket')
        ) {
          throw new Error(
            'The "post-images" storage bucket was not found in your Supabase project. You can run the schema.sql script or paste an image URL directly below.'
          );
        }
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        onChange(publicUrlData.publicUrl);
      } else {
        throw new Error('Failed to retrieve public image URL.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to upload image to Supabase Storage.';
      setUploadError(msg);
      setShowUrlInput(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">image</span>
          <span>Featured Image</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-medium text-secondary hover:text-on-surface flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">link</span>
          <span>{showUrlInput ? 'Hide URL input' : 'Paste image URL'}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Existing image preview */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest group max-w-xl">
          <div className="relative w-full h-48 bg-surface-container-low">
            <Image
              src={value}
              alt="Featured image preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-3 flex items-center justify-between gap-3 bg-surface-container-lowest border-t border-outline-variant/30">
            <span className="text-xs font-mono text-secondary truncate max-w-[320px]">
              {value}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="p-1 rounded-lg text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                title="Remove image"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant/50 hover:border-primary/50 bg-surface-container-lowest hover:bg-surface-container-low/40'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-on-surface">
                Uploading image to Supabase Storage (&quot;post-images&quot;)...
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface">
                  Click to browse or drag and drop image here
                </p>
                <p className="text-[11px] text-secondary mt-0.5">
                  Uploaded to Supabase Storage (PNG, JPG, WebP up to 8MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual URL input fallback */}
      {showUrlInput && (
        <div className="pt-1.5 space-y-1 animate-fadeIn">
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[16px]">
              link
            </span>
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="https://images.unsplash.com/... or direct image link"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-mono focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>
          <p className="text-[10px] text-secondary">
            Provide an absolute URL if hosting outside Supabase Storage.
          </p>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error flex items-start gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
          <div className="flex-1">
            <p className="font-semibold">Upload Notice</p>
            <p className="mt-0.5 text-[11px] opacity-90">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-error/70 hover:text-error"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
