"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Link2, Lock, Clock, Hash } from "lucide-react";
import { toast } from "sonner";

export default function NewLinkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    originalUrl: "",
    title: "",
    customSlug: "",
    useCustomSlug: false,
    password: "",
    usePassword: false,
    expiresAt: "",
    useExpiry: false,
    maxClicks: "",
    useMaxClicks: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        originalUrl: formData.originalUrl,
      };

      if (formData.title) payload.title = formData.title;
      if (formData.useCustomSlug && formData.customSlug) {
        payload.slug = formData.customSlug;
      }
      if (formData.usePassword && formData.password) {
        payload.password = formData.password;
      }
      if (formData.useExpiry && formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt).toISOString();
      }
      if (formData.useMaxClicks && formData.maxClicks) {
        payload.maxClicks = parseInt(formData.maxClicks);
      }

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create link");
        return;
      }

      toast.success("Link created successfully!");
      router.push(`/links/${data.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/links">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Link</h1>
          <p className="text-gray-500">Shorten a URL and track its performance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Link Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="originalUrl">Destination URL *</Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://example.com/very-long-url"
                value={formData.originalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, originalUrl: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                type="text"
                placeholder="My awesome link"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Custom Slug</Label>
                  <p className="text-sm text-gray-500">
                    Use a custom short URL instead of random
                  </p>
                </div>
                <Switch
                  checked={formData.useCustomSlug}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, useCustomSlug: checked })
                  }
                />
              </div>
              {formData.useCustomSlug && (
                <Input
                  type="text"
                  placeholder="my-custom-slug"
                  value={formData.customSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, customSlug: e.target.value })
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Options</CardTitle>
            <CardDescription>
              Add password protection, expiry, or click limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Protection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label>Password Protection</Label>
                    <p className="text-sm text-gray-500">
                      Require a password to access
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.usePassword}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, usePassword: checked })
                  }
                />
              </div>
              {formData.usePassword && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label>Expiry Date</Label>
                    <p className="text-sm text-gray-500">
                      Link expires after this date
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.useExpiry}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, useExpiry: checked })
                  }
                />
              </div>
              {formData.useExpiry && (
                <Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              )}
            </div>

            {/* Max Clicks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label>Click Limit</Label>
                    <p className="text-sm text-gray-500">
                      Link expires after N clicks
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.useMaxClicks}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, useMaxClicks: checked })
                  }
                />
              </div>
              {formData.useMaxClicks && (
                <Input
                  type="number"
                  placeholder="100"
                  min="1"
                  value={formData.maxClicks}
                  onChange={(e) =>
                    setFormData({ ...formData, maxClicks: e.target.value })
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Link"
            )}
          </Button>
          <Link href="/links">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
