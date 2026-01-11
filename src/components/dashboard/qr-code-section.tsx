"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface QRCodeSectionProps {
  linkId: string;
  qrCode: {
    id: string;
    foreground: string;
    background: string;
    size: number;
  } | null;
  shortUrl: string;
}

export function QRCodeSection({ linkId, qrCode, shortUrl }: QRCodeSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    id: string;
    dataUrl: string;
    foreground: string;
    background: string;
  } | null>(null);
  const [foreground, setForeground] = useState(qrCode?.foreground || "#000000");
  const [background, setBackground] = useState(qrCode?.background || "#FFFFFF");

  useEffect(() => {
    if (qrCode) {
      fetchQRCode(qrCode.id);
    }
  }, [qrCode]);

  const fetchQRCode = async (id: string) => {
    try {
      const res = await fetch(`/api/qr/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQrData(data);
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
    }
  };

  const createQRCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId,
          foreground,
          background,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create QR code");
        return;
      }

      const data = await res.json();
      toast.success("QR code created!");
      fetchQRCode(data.id);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQRCode = async () => {
    if (!qrData) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/qr/${qrData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foreground, background }),
      });

      if (!res.ok) {
        toast.error("Failed to update QR code");
        return;
      }

      toast.success("QR code updated!");
      fetchQRCode(qrData.id);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = async (format: "png" | "svg") => {
    if (!qrData) return;

    try {
      const res = await fetch(`/api/qr/${qrData.id}/download?format=${format}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrData ? (
          <>
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img
                src={qrData.dataUrl}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foreground">Foreground</Label>
                <div className="flex gap-2">
                  <Input
                    id="foreground"
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Background</Label>
                <div className="flex gap-2">
                  <Input
                    id="background"
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={updateQRCode}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Update Colors
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => downloadQR("png")}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                PNG
              </Button>
              <Button
                onClick={() => downloadQR("svg")}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                SVG
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No QR code yet</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="fg">Foreground</Label>
                <Input
                  id="fg"
                  type="color"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bg">Background</Label>
                <Input
                  id="bg"
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
            </div>

            <Button onClick={createQRCode} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
