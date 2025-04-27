
import React, { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { extractInvoiceData } from '@/utils/extractInvoiceData';
import { Invoice } from '@/types/invoice';

interface FileUploaderProps {
  onFileProcessed: (invoice: Invoice) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const processFile = useCallback(async (file: File) => {
    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const invoice = await extractInvoiceData(file);
      setProgress(100);
      
      onFileProcessed(invoice);
      
      toast({
        title: "File processed successfully",
        description: `Extracted data from ${file.name}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Could not extract data from the PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      clearInterval(interval);
    }
  }, [onFileProcessed, toast]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);
  
  return (
    <Card className={cn(
      "border-2 border-dashed p-10 text-center transition-all flex flex-col items-center justify-center",
      isDragging ? "border-primary bg-secondary/20" : "border-muted-foreground/25",
      isProcessing && "opacity-75"
    )}>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="w-full h-full flex flex-col items-center justify-center"
      >
        {isProcessing ? (
          <div className="w-full max-w-md">
            <File className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse-opacity" />
            <h3 className="text-lg font-medium mb-2">Processing invoice...</h3>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              Extracting data from your invoice
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Invoice PDF</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Drag and drop your utility invoice PDF here, or click to select a file. 
              We'll automatically extract the relevant information.
            </p>
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".pdf" 
              onChange={handleFileChange} 
              disabled={isProcessing}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={isProcessing}>
                <span>Select PDF File</span>
              </Button>
            </label>
          </>
        )}
      </div>
    </Card>
  );
};

export default FileUploader;
