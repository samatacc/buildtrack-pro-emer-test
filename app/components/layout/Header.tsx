import React from "react";
import { Button } from "@radix-ui/themes";
import Link from "next/link";

export default function Header(): React.ReactNode {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              BuildTrack Pro
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="soft">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
