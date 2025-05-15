import React, { useState, useEffect } from 'react';
import { File as FileType } from '../../contexts/FileContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FileText, AlertTriangle } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import { read, utils } from 'xlsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactPlayer from 'react-player';

interface FilePreviewProps {
  file: FileType;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const { theme } = useTheme();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fileType = file.type.toLowerCase();
  const isImage = fileType.includes('image') || /\.(jpg|jpeg|png|gif|svg)$/i.test(file.name);
  const isVideo = fileType.includes('video') || /\.(mp4|webm|ogg|mov)$/i.test(file.name);
  const isAudio = fileType.includes('audio') || /\.(mp3|wav|ogg)$/i.test(file.name);
  const isPdf = fileType.includes('pdf') || /\.pdf$/i.test(file.name);
  const isMarkdown = /\.md$/i.test(file.name);
  const isSpreadsheet = /\.(xlsx|xls|csv)$/i.test(file.name);
  const isText = fileType.includes('text') || /\.(txt|log|json|js|ts|html|css|xml)$/i.test(file.name);
  const isCode = /\.(js|jsx|ts|tsx|html|css|json|py|java|c|cpp|rb)$/i.test(file.name);

  useEffect(() => {
    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For code and text files
        if (isText || isCode || isMarkdown) {
          const response = await fetch(file.url);
          if (!response.ok) throw new Error('Failed to fetch file');
          const text = await response.text();
          setPreviewContent(text);
        }
        
        // For spreadsheets
        if (isSpreadsheet) {
          const response = await fetch(file.url);
          if (!response.ok) throw new Error('Failed to fetch file');
          const arrayBuffer = await response.arrayBuffer();
          const workbook = read(arrayBuffer);
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = utils.sheet_to_json(worksheet);
          setPreviewContent(jsonData);
        }
        
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isText || isCode || isMarkdown || isSpreadsheet) {
      loadPreview();
    } else {
      setIsLoading(false);
    }
  }, [file, isText, isCode, isMarkdown, isSpreadsheet]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
            Preview unavailable
          </h3>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {error}
          </p>
        </div>
      );
    }
    
    // Image preview
    if (isImage) {
      return (
        <div className="flex justify-center">
          <img 
            src={file.url} 
            alt={file.name} 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    }
    
    // Video preview
    if (isVideo) {
      return (
        <div className="flex justify-center">
          <ReactPlayer
            url={file.url}
            controls
            width="100%"
            height="auto"
            className="max-w-full max-h-[70vh]"
          />
        </div>
      );
    }
    
    // Audio preview
    if (isAudio) {
      return (
        <div className="flex justify-center my-8">
          <audio 
            src={file.url} 
            controls 
            className="w-full max-w-lg"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    
    // PDF preview
    if (isPdf) {
      return (
        <div className="flex flex-col items-center">
          <Document
            file={file.url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  Failed to load PDF
                </h3>
              </div>
            }
          >
            <Page 
              pageNumber={currentPage} 
              width={Math.min(600, window.innerWidth - 40)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          
          {numPages && numPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`px-3 py-1 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                }`}
              >
                Previous
              </button>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                {currentPage} / {numPages}
              </span>
              <button
                disabled={currentPage >= (numPages || 1)}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages || 1))}
                className={`px-3 py-1 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      );
    }
    
    // Markdown preview
    if (isMarkdown && previewContent) {
      return (
        <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''} p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <ReactMarkdown>
            {previewContent}
          </ReactMarkdown>
        </div>
      );
    }
    
    // Code preview
    if (isCode && previewContent) {
      const language = file.name.split('.').pop() || 'text';
      
      return (
        <div className="rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={language}
            style={theme === 'dark' ? tomorrow : prism}
            showLineNumbers
            customStyle={{ margin: 0 }}
          >
            {previewContent}
          </SyntaxHighlighter>
        </div>
      );
    }
    
    // Text preview
    if (isText && previewContent) {
      return (
        <div className={`font-mono text-sm whitespace-pre-wrap p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
          {previewContent}
        </div>
      );
    }
    
    // Spreadsheet preview
    if (isSpreadsheet && previewContent) {
      return (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {previewContent.length > 0 && Object.keys(previewContent[0]).map((key, idx) => (
                  <th 
                    key={idx}
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {previewContent.map((row: any, rowIdx: number) => (
                <tr key={rowIdx}>
                  {Object.values(row).map((cell: any, cellIdx: number) => (
                    <td 
                      key={cellIdx}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                    >
                      {cell?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    // Default "no preview" state
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <FileText className={`h-16 w-16 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
          Preview not available
        </h3>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          This file type doesn't support previewing. Please download the file to view it.
        </p>
      </div>
    );
  };
  
  return (
    <div className={`overflow-hidden rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className={`px-4 py-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} sm:px-6`}>
        <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Preview
        </h3>
      </div>
      <div className={`px-4 py-5 sm:p-6 ${file.type.includes('text') ? 'font-mono' : ''}`}>
        {renderPreview()}
      </div>
    </div>
  );
};

export default FilePreview;