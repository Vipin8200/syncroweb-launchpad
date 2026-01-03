import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string | null;
  applicantName: string;
}

export function ResumeViewerModal({
  isOpen,
  onClose,
  resumeUrl,
  applicantName,
}: ResumeViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, resumeUrl]);

  if (!resumeUrl) return null;

  const isPdf = resumeUrl.toLowerCase().includes(".pdf");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {applicantName}'s Resume
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative bg-muted rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {isPdf ? (
            <iframe
              src={resumeUrl}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              title="Resume PDF"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div>
                <p className="font-medium mb-1">Document Preview Not Available</p>
                <p className="text-sm text-muted-foreground">
                  This file format cannot be previewed. Please download to view.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={resumeUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 shrink-0">
          <Button variant="outline" asChild>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </a>
          </Button>
          <Button asChild>
            <a href={resumeUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
