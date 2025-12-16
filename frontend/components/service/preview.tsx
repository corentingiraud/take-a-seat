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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
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
            <ReactMarkdown components={{ a: LinkRenderer}}>{service.description}</ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
