"use client";

import ReactMarkdown from "react-markdown";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

import { Service } from "@/models/service";

interface ServicePreviewProps {
  service: Service;
}

export const ServicePreview = ({ service }: ServicePreviewProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Plus d&apos;information</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{service.description}</ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
