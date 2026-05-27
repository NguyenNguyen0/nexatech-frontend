import { useState, useCallback, useRef } from 'react';
import { uploadNewsImage, deleteImageByPublicId, type ImageAssetResponse } from '@/services/newsApi';
import { toast } from 'sonner';

/**
 * Temporary image state before upload to object storage.
 */
interface TempImage {
  tempUrl: string; // ObjectURL for preview
  file: File;
  uploading?: boolean;
  storedUrl?: string; // URL after upload
  publicId?: string; // Storage object identifier
  error?: string;
}

interface ProcessedNewsContent {
  html: string;
  json?: object;
}

/**
 * Hook to manage news images with temporary local storage and AWS S3 upload.
 * 
 * Flow:
 * 1. User uploads image → create ObjectURL → show in editor immediately
 * 2. Store temp images in state with their ObjectURLs
 * 3. When Save button clicked → upload all temp images through news-service
 * 4. Replace temp URLs with S3/public URLs in content
 * 5. Cleanup: revoke ObjectURLs and delete unused images
 */
export const useNewsImageUpload = () => {
  // Map: tempUrl -> TempImage
  const [tempImages, setTempImages] = useState<Map<string, TempImage>>(new Map());
  
  // Track uploaded images (from existing news or newly uploaded)
  const [uploadedImages, setUploadedImages] = useState<ImageAssetResponse[]>([]);
  
  // Track images to delete on save
  const deleteQueue = useRef<string[]>([]); // Array of publicIds
  
  /**
   * Create temporary image from File
   * Returns ObjectURL that can be used immediately in editor
   */
  const createTempImage = useCallback((file: File): string => {
    const tempUrl = URL.createObjectURL(file);
    
    setTempImages(prev => {
      const newMap = new Map(prev);
      newMap.set(tempUrl, {
        tempUrl,
        file,
        uploading: false,
      });
      return newMap;
    });
    
    return tempUrl;
  }, []);
  
  /**
   * Upload a single temp image through news-service.
   */
  const uploadSingleImage = useCallback(async (
    tempUrl: string,
    targetNewsId: string
  ): Promise<string | null> => {
    const tempImage = tempImages.get(tempUrl);
    if (!tempImage || tempImage.storedUrl) {
      return tempImage?.storedUrl || null;
    }
    
    // Mark as uploading
    setTempImages(prev => {
      const newMap = new Map(prev);
      const img = newMap.get(tempUrl);
      if (img) {
        img.uploading = true;
        newMap.set(tempUrl, { ...img });
      }
      return newMap;
    });
    
    try {
      const response = await uploadNewsImage(targetNewsId, tempImage.file);
      const imageAsset = response.result;
      
      // Update temp image with public storage URL
      setTempImages(prev => {
        const newMap = new Map(prev);
        const img = newMap.get(tempUrl);
        if (img) {
          img.uploading = false;
          img.storedUrl = imageAsset.url;
          img.publicId = imageAsset.publicId;
          newMap.set(tempUrl, { ...img });
        }
        return newMap;
      });
      
      // Add to uploaded images
      setUploadedImages(prev => [...prev, imageAsset]);
      
      return imageAsset.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      
      setTempImages(prev => {
        const newMap = new Map(prev);
        const img = newMap.get(tempUrl);
        if (img) {
          img.uploading = false;
          img.error = 'Upload failed';
          newMap.set(tempUrl, { ...img });
        }
        return newMap;
      });
      
      throw error;
    }
  }, [tempImages]);
  
  /**
   * Upload all temp images.
   * Returns map of tempUrl -> stored URL.
   */
  const uploadAllTempImages = useCallback(async (
    targetNewsId: string
  ): Promise<Map<string, string>> => {
    const urlMap = new Map<string, string>();
    const uploadPromises: Promise<void>[] = [];
    
    for (const [tempUrl, tempImage] of tempImages.entries()) {
      // Skip if already uploaded
      if (tempImage.storedUrl) {
        urlMap.set(tempUrl, tempImage.storedUrl);
        continue;
      }
      
      const promise = uploadSingleImage(tempUrl, targetNewsId)
        .then(storedUrl => {
          if (storedUrl) {
            urlMap.set(tempUrl, storedUrl);
          }
        })
        .catch(error => {
          console.error(`Failed to upload ${tempUrl}:`, error);
          toast.error(`Không thể upload ảnh: ${tempImage.file.name}`);
        });
      
      uploadPromises.push(promise);
    }
    
    await Promise.all(uploadPromises);
    return urlMap;
  }, [tempImages, uploadSingleImage]);
  
  /**
   * Replace all temp URLs in HTML content with stored URLs.
   */
  const replaceUrlsInContent = useCallback((
    html: string,
    urlMap: Map<string, string>
  ): string => {
    let updatedHtml = html;
    
    for (const [tempUrl, storedUrl] of urlMap.entries()) {
      // Replace in src attributes
      updatedHtml = updatedHtml.replace(
        new RegExp(escapeRegExp(tempUrl), 'g'),
        storedUrl
      );
    }
    
    return updatedHtml;
  }, []);

  const replaceUrlsInJson = useCallback((
    json: unknown,
    urlMap: Map<string, string>
  ): object | undefined => {
    if (!json || typeof json !== 'object') {
      return undefined;
    }

    const replaceValue = (value: unknown): unknown => {
      if (typeof value === 'string') {
        let updatedValue = value;
        for (const [tempUrl, storedUrl] of urlMap.entries()) {
          updatedValue = updatedValue.replace(
            new RegExp(escapeRegExp(tempUrl), 'g'),
            storedUrl
          );
        }
        return updatedValue;
      }

      if (Array.isArray(value)) {
        return value.map(replaceValue);
      }

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, childValue]) => [
            key,
            replaceValue(childValue),
          ])
        );
      }

      return value;
    };

    return replaceValue(json) as object;
  }, []);
  
  /**
   * Mark image for deletion (will be deleted on save)
   */
  const markImageForDeletion = useCallback((publicId: string) => {
    if (!deleteQueue.current.includes(publicId)) {
      deleteQueue.current.push(publicId);
    }
  }, []);
  
  /**
   * Detect deleted images by comparing current content with uploaded images
   */
  const detectDeletedImages = useCallback((currentHtml: string): string[] => {
    const deletedPublicIds: string[] = [];
    
    for (const image of uploadedImages) {
      // Check if image URL exists in current content
      if (!currentHtml.includes(image.url)) {
        deletedPublicIds.push(image.publicId);
      }
    }
    
    return deletedPublicIds;
  }, [uploadedImages]);
  
  /**
   * Delete images through news-service.
   */
  const deleteImages = useCallback(async (publicIds: string[]) => {
    const deletePromises = publicIds.map(async (publicId) => {
      try {
        await deleteImageByPublicId(publicId);
        console.log(`Deleted image: ${publicId}`);
      } catch (error) {
        console.error(`Failed to delete image ${publicId}:`, error);
      }
    });
    
    await Promise.all(deletePromises);
  }, []);
  
  /**
   * Cleanup: revoke ObjectURLs and delete queued images
   */
  const cleanup = useCallback(async () => {
    // Revoke all ObjectURLs
    for (const [tempUrl] of tempImages.entries()) {
      URL.revokeObjectURL(tempUrl);
    }
    
    // Delete queued images from storage
    if (deleteQueue.current.length > 0) {
      await deleteImages(deleteQueue.current);
      deleteQueue.current = [];
    }
    
    // Clear state
    setTempImages(new Map());
  }, [tempImages, deleteImages]);
  
  /**
   * Initialize uploaded images from existing news
   */
  const initializeUploadedImages = useCallback((images: ImageAssetResponse[]) => {
    setUploadedImages(images);
  }, []);
  
  /**
   * Main save flow:
   * 1. Upload all temp images
   * 2. Replace URLs in content
   * 3. Detect and delete removed images
   * 4. Cleanup temp resources
   */
  const processSave = useCallback(async (
    htmlContent: string,
    targetNewsId: string,
    jsonContent?: object
  ): Promise<ProcessedNewsContent> => {
    try {
      // Step 1: Upload all temp images
      const urlMap = await uploadAllTempImages(targetNewsId);
      
      // Step 2: Replace temp URLs with storage URLs
      const updatedHtml = replaceUrlsInContent(htmlContent, urlMap);
      const updatedJson = replaceUrlsInJson(jsonContent, urlMap);
      
      // Step 3: Detect deleted images
      const deletedPublicIds = detectDeletedImages(updatedHtml);
      
      // Add to delete queue
      deletedPublicIds.forEach(publicId => markImageForDeletion(publicId));
      
      // Step 4: Delete removed images
      if (deleteQueue.current.length > 0) {
        await deleteImages(deleteQueue.current);
        deleteQueue.current = [];
      }
      
      // Step 5: Cleanup temp resources
      await cleanup();
      
      return {
        html: updatedHtml,
        json: updatedJson,
      };
    } catch (error) {
      console.error('Failed to process save:', error);
      throw error;
    }
  }, [
    uploadAllTempImages,
    replaceUrlsInContent,
    replaceUrlsInJson,
    detectDeletedImages,
    markImageForDeletion,
    deleteImages,
    cleanup,
  ]);
  
  return {
    // State
    tempImages,
    uploadedImages,
    
    // Actions
    createTempImage,
    uploadSingleImage,
    uploadAllTempImages,
    replaceUrlsInContent,
    markImageForDeletion,
    detectDeletedImages,
    deleteImages,
    cleanup,
    initializeUploadedImages,
    processSave,
  };
};

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
