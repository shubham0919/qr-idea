import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bomb } from "lucide-react";

export default function LinkDestroyedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <Bomb className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Link Self-Destructed
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            This link was configured to self-destruct and is no longer available.
            The link owner set it to expire after a certain condition was met.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
