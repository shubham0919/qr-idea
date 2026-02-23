import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function LinkNotActivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Link Not Yet Active
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            This link is scheduled to become active at a later time. Please check
            back later or contact the link owner for more information.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
