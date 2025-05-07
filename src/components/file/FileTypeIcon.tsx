import React from 'react';
import { FileText, FileImage, FileVideo, FileAudio, File as FileIcon, FileCode, FileSpreadsheet, File as FilePpt } from 'lucide-react';

interface FileTypeIconProps {
  fileType: string;
  size?: number;
}

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileType, size = 24 }) => {
  // Helper function to determine icon based on MIME type or file extension
  const getIcon = () => {
    const type = fileType.toLowerCase();
    
    // Image types
    if (type.includes('image') || 
        type.endsWith('.jpg') || 
        type.endsWith('.jpeg') || 
        type.endsWith('.png') || 
        type.endsWith('.gif') || 
        type.endsWith('.svg')) {
      return <FileImage size={size} className="text-blue-500" />;
    }
    
    // Video types
    if (type.includes('video') || 
        type.endsWith('.mp4') || 
        type.endsWith('.avi') || 
        type.endsWith('.mov') || 
        type.endsWith('.wmv')) {
      return <FileVideo size={size} className="text-red-500" />;
    }
    
    // Audio types
    if (type.includes('audio') || 
        type.endsWith('.mp3') || 
        type.endsWith('.wav') || 
        type.endsWith('.ogg')) {
      return <FileAudio size={size} className="text-yellow-500" />;
    }
    
    // Document types
    if (type.includes('pdf') || 
        type.endsWith('.pdf')) {
      return <FileText size={size} className="text-red-700" />;
    }
    
    // Text and markdown
    if (type.includes('text') || 
        type.endsWith('.txt') || 
        type.endsWith('.md') || 
        type.endsWith('.markdown')) {
      return <FileText size={size} className="text-gray-500" />;
    }
    
    // Code files
    if (type.includes('javascript') || 
        type.includes('typescript') ||
        type.endsWith('.js') || 
        type.endsWith('.ts') || 
        type.endsWith('.jsx') || 
        type.endsWith('.tsx') || 
        type.endsWith('.html') || 
        type.endsWith('.css') || 
        type.endsWith('.json') || 
        type.endsWith('.py') || 
        type.endsWith('.java') || 
        type.endsWith('.c') || 
        type.endsWith('.cpp')) {
      return <FileCode size={size} className="text-indigo-500" />;
    }
    
    // Spreadsheets
    if (type.includes('sheet') || 
        type.includes('excel') ||
        type.endsWith('.xlsx') || 
        type.endsWith('.xls') || 
        type.endsWith('.csv')) {
      return <FileSpreadsheet size={size} className="text-green-600" />;
    }
    
    // Presentations
    if (type.includes('presentation') || 
        type.endsWith('.pptx') || 
        type.endsWith('.ppt')) {
      return <FilePpt size={size} className="text-orange-500" />;
    }
    
    // Default file icon for unrecognized types
    return <FileIcon size={size} className="text-gray-400" />;
  };
  
  return getIcon();
};

export default FileTypeIcon;