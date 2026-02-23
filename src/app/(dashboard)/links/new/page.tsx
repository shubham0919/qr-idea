"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Link2,
  Lock,
  Clock,
  Hash,
  Bomb,
  Globe,
  Smartphone,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "CN", name: "China" },
];

const DEVICES = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

export default function NewLinkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRestrictions, setShowRestrictions] = useState(false);
  const [showUTM, setShowUTM] = useState(false);

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
    // Self-destruct
    selfDestructType: "NONE",
    selfDestructClicks: "",
    selfDestructAt: "",
    destroyRedirectUrl: "",
    // Geo restrictions
    allowedCountries: [] as string[],
    blockedCountries: [] as string[],
    // Device restrictions
    allowedDevices: [] as string[],
    blockedDevices: [] as string[],
    // UTM
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
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

      // Self-destruct
      if (formData.selfDestructType !== "NONE") {
        payload.selfDestructType = formData.selfDestructType;
        if (formData.selfDestructType === "AFTER_N_CLICKS" && formData.selfDestructClicks) {
          payload.selfDestructClicks = parseInt(formData.selfDestructClicks);
        }
        if (formData.selfDestructType === "AFTER_TIME" && formData.selfDestructAt) {
          payload.selfDestructAt = new Date(formData.selfDestructAt).toISOString();
        }
        if (formData.destroyRedirectUrl) {
          payload.destroyRedirectUrl = formData.destroyRedirectUrl;
        }
      }

      // Geo restrictions
      if (formData.allowedCountries.length > 0) {
        payload.allowedCountries = formData.allowedCountries;
      }
      if (formData.blockedCountries.length > 0) {
        payload.blockedCountries = formData.blockedCountries;
      }

      // Device restrictions
      if (formData.allowedDevices.length > 0) {
        payload.allowedDevices = formData.allowedDevices;
      }
      if (formData.blockedDevices.length > 0) {
        payload.blockedDevices = formData.blockedDevices;
      }

      // UTM
      if (formData.utmSource) payload.utmSource = formData.utmSource;
      if (formData.utmMedium) payload.utmMedium = formData.utmMedium;
      if (formData.utmCampaign) payload.utmCampaign = formData.utmCampaign;

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

  const toggleCountry = (code: string, list: "allowed" | "blocked") => {
    const key = list === "allowed" ? "allowedCountries" : "blockedCountries";
    const current = formData[key];
    if (current.includes(code)) {
      setFormData({ ...formData, [key]: current.filter((c) => c !== code) });
    } else {
      setFormData({ ...formData, [key]: [...current, code] });
    }
  };

  const toggleDevice = (device: string, list: "allowed" | "blocked") => {
    const key = list === "allowed" ? "allowedDevices" : "blockedDevices";
    const current = formData[key];
    if (current.includes(device)) {
      setFormData({ ...formData, [key]: current.filter((d) => d !== device) });
    } else {
      setFormData({ ...formData, [key]: [...current, device] });
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
          <h1 className="text-2xl font-bold">Create New Link</h1>
          <p className="text-muted-foreground">
            Shorten a URL and track its performance
          </p>
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
                  <p className="text-sm text-muted-foreground">
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
          <CardHeader
            className="cursor-pointer"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>
                  Password protection, expiry, click limits
                </CardDescription>
              </div>
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-6">
              {/* Password Protection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>Password Protection</Label>
                      <p className="text-sm text-muted-foreground">
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
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>Expiry Date</Label>
                      <p className="text-sm text-muted-foreground">
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
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>Click Limit</Label>
                      <p className="text-sm text-muted-foreground">
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

              {/* Self-Destruct */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bomb className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Self-Destruct</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically destroy link after condition
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    Pro
                  </Badge>
                </div>
                <Select
                  value={formData.selfDestructType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, selfDestructType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="AFTER_FIRST_CLICK">
                      After first click
                    </SelectItem>
                    <SelectItem value="AFTER_N_CLICKS">
                      After N clicks
                    </SelectItem>
                    <SelectItem value="AFTER_TIME">After time</SelectItem>
                  </SelectContent>
                </Select>
                {formData.selfDestructType === "AFTER_N_CLICKS" && (
                  <Input
                    type="number"
                    placeholder="Number of clicks"
                    min="1"
                    value={formData.selfDestructClicks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selfDestructClicks: e.target.value,
                      })
                    }
                  />
                )}
                {formData.selfDestructType === "AFTER_TIME" && (
                  <Input
                    type="datetime-local"
                    value={formData.selfDestructAt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selfDestructAt: e.target.value,
                      })
                    }
                  />
                )}
                {formData.selfDestructType !== "NONE" && (
                  <div className="space-y-2">
                    <Label>Redirect URL after destruction (optional)</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/link-expired"
                      value={formData.destroyRedirectUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destroyRedirectUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Access Restrictions */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setShowRestrictions(!showRestrictions)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Access Restrictions
                  <Badge variant="secondary">Pro</Badge>
                </CardTitle>
                <CardDescription>
                  Geo, device, and IP-based access control
                </CardDescription>
              </div>
              {showRestrictions ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {showRestrictions && (
            <CardContent className="space-y-6">
              {/* Country Restrictions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label>Country Restrictions</Label>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Allowed countries (leave empty to allow all)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map((country) => (
                      <Badge
                        key={country.code}
                        variant={
                          formData.allowedCountries.includes(country.code)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleCountry(country.code, "allowed")}
                      >
                        {country.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Blocked countries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map((country) => (
                      <Badge
                        key={country.code}
                        variant={
                          formData.blockedCountries.includes(country.code)
                            ? "destructive"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleCountry(country.code, "blocked")}
                      >
                        {country.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Device Restrictions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label>Device Restrictions</Label>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Allowed devices (leave empty to allow all)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEVICES.map((device) => (
                      <Badge
                        key={device.value}
                        variant={
                          formData.allowedDevices.includes(device.value)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleDevice(device.value, "allowed")}
                      >
                        {device.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Blocked devices
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEVICES.map((device) => (
                      <Badge
                        key={device.value}
                        variant={
                          formData.blockedDevices.includes(device.value)
                            ? "destructive"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleDevice(device.value, "blocked")}
                      >
                        {device.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* UTM Parameters */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setShowUTM(!showUTM)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  UTM Parameters
                </CardTitle>
                <CardDescription>
                  Add tracking parameters to your links
                </CardDescription>
              </div>
              {showUTM ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {showUTM && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="utmSource">Source</Label>
                <Input
                  id="utmSource"
                  placeholder="e.g., google, facebook, newsletter"
                  value={formData.utmSource}
                  onChange={(e) =>
                    setFormData({ ...formData, utmSource: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmMedium">Medium</Label>
                <Input
                  id="utmMedium"
                  placeholder="e.g., cpc, email, social"
                  value={formData.utmMedium}
                  onChange={(e) =>
                    setFormData({ ...formData, utmMedium: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmCampaign">Campaign</Label>
                <Input
                  id="utmCampaign"
                  placeholder="e.g., spring_sale, product_launch"
                  value={formData.utmCampaign}
                  onChange={(e) =>
                    setFormData({ ...formData, utmCampaign: e.target.value })
                  }
                />
              </div>
            </CardContent>
          )}
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
