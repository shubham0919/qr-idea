import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QrCode,
  Link2,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Check,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">LinkQR</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-blue-50" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Smart Links & QR Codes
              <span className="text-primary"> for Modern Marketing</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 md:text-xl">
              Create branded QR codes, shorten URLs, and track engagement with powerful
              analytics. Everything you need to connect your offline and online presence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See How it Works
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required. Free plan includes 20 links.
            </p>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 rounded-xl border bg-white p-2 shadow-2xl mx-auto max-w-4xl">
            <div className="rounded-lg bg-gray-100 p-8">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <QrCode className="h-32 w-32 text-gray-800" />
                </div>
                <div className="text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Link Active</span>
                  </div>
                  <div className="text-3xl font-bold">12,847</div>
                  <div className="text-sm text-gray-500">Total Clicks</div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">68%</span> Mobile
                    </div>
                    <div>
                      <span className="font-medium">32%</span> Desktop
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features to create, manage, and track your links and QR codes
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">URL Shortening</CardTitle>
                <CardDescription>
                  Create short, branded links that are easy to share and remember
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Custom QR Codes</CardTitle>
                <CardDescription>
                  Generate beautiful QR codes with custom colors and download in any format
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Advanced Analytics</CardTitle>
                <CardDescription>
                  Track clicks, devices, locations, and more with detailed insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Password Protection</CardTitle>
                <CardDescription>
                  Secure your links with passwords for private content
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Link Expiration</CardTitle>
                <CardDescription>
                  Set expiry dates or click limits for time-sensitive campaigns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Fast Redirects</CardTitle>
                <CardDescription>
                  Sub-second redirect latency with global CDN infrastructure
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Link</h3>
              <p className="text-gray-600">
                Paste your long URL and get a short, trackable link instantly
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate QR Code</h3>
              <p className="text-gray-600">
                Create a custom QR code for your link with your brand colors
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Analyze</h3>
              <p className="text-gray-600">
                Monitor clicks, locations, and devices in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free and upgrade as you grow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For personal use</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>20 links</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>20 QR codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic QR customization</span>
                  </li>
                </ul>
                <Link href="/register" className="block mt-6">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For professionals</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited links</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited QR codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Password protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Link expiration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Custom QR templates</span>
                  </li>
                </ul>
                <Link href="/register" className="block mt-6">
                  <Button className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>SSO authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>SLA guarantee</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Loved by Marketers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 italic">
                  &quot;LinkQR has transformed how we run our marketing campaigns. The analytics are incredibly detailed.&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">Marketing Director</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 italic">
                  &quot;The QR code customization is amazing. We can match our brand perfectly every time.&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-medium">Michael Chen</div>
                    <div className="text-sm text-gray-500">Brand Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 italic">
                  &quot;Simple to use, powerful analytics, and the free plan is generous. Highly recommended!&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-medium">Emily Rodriguez</div>
                    <div className="text-sm text-gray-500">Startup Founder</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <details className="group bg-white rounded-lg p-6 border">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium">What happens when I reach my link limit?</span>
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600">
                When you reach your link limit, you&apos;ll need to upgrade to a Pro plan for unlimited links, or delete some existing links to create new ones.
              </p>
            </details>

            <details className="group bg-white rounded-lg p-6 border">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium">Can I change my link destination after creating it?</span>
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! All links on LinkQR are dynamic, meaning you can change the destination URL at any time without changing the short link itself.
              </p>
            </details>

            <details className="group bg-white rounded-lg p-6 border">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium">How accurate is the analytics data?</span>
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600">
                We track every click in real-time with duplicate filtering. Our geo-location data is accurate to the city level, and device detection covers all major platforms and browsers.
              </p>
            </details>

            <details className="group bg-white rounded-lg p-6 border">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium">Can I use my own custom domain?</span>
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600">
                Custom domains are available on Pro and Enterprise plans. You can use your own branded domain for all your short links.
              </p>
            </details>

            <details className="group bg-white rounded-lg p-6 border">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium">Is there an API available?</span>
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600">
                API access is available on the Enterprise plan. It allows you to programmatically create links, generate QR codes, and retrieve analytics data.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of marketers who use LinkQR to create smarter links and QR codes.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="mt-8">
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <QrCode className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">LinkQR</span>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Create branded QR codes and short links with powerful analytics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">API</a></li>
                <li><a href="#" className="hover:text-gray-900">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LinkQR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
