import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LogUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const parseLogFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    const logs = lines.slice(0, 100).map((line, idx) => {
      // Simple log parser - can be enhanced for different formats
      const timestamp = new Date();
      let level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO';
      
      if (line.includes('ERROR') || line.includes('error')) level = 'ERROR';
      else if (line.includes('WARN') || line.includes('warning')) level = 'WARNING';
      else if (line.includes('CRITICAL') || line.includes('critical')) level = 'CRITICAL';
      else if (line.includes('DEBUG') || line.includes('debug')) level = 'DEBUG';
      
      return {
        timestamp: timestamp.toISOString(),
        source_name: file.name,
        level,
        message: line,
        raw_data: line,
      };
    });
    
    return logs;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      let processedFiles = 0;
      
      for (const file of files) {
        const logs = await parseLogFile(file);
        
        const { error } = await supabase
          .from('logs')
          .insert(logs);
        
        if (error) throw error;
        
        processedFiles++;
        setProgress((processedFiles / files.length) * 100);
      }
      
      toast({
        title: "Upload successful!",
        description: `Successfully imported ${files.length} log file(s).`,
      });
      
      setFiles([]);
      setProgress(0);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Log Files
        </CardTitle>
        <CardDescription>
          Upload log files in various formats (txt, log, json, csv)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            multiple
            accept=".txt,.log,.json,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to browse or drag and drop files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: TXT, LOG, JSON, CSV
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files:</p>
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-center text-muted-foreground">
              Processing... {Math.round(progress)}%
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
        </Button>

        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Files are automatically parsed and analyzed. Large files may take a few moments to process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogUpload;