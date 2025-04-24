import React from "react";
import { Button, Heading, Text } from "@radix-ui/themes";
import Header from "./components/layout/Header";

export default function Home(): React.ReactNode {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <Heading size="9" className="max-w-3xl">
            Streamline Your Construction Projects with BuildTrack Pro
          </Heading>
          <Text size="5" className="mt-6 max-w-2xl text-gray-600">
            The comprehensive construction management solution that helps you
            manage projects, teams, and resources all in one place.
          </Text>
          <div className="mt-10 flex items-center space-x-4">
            <Button size="4">Get Started</Button>
            <Button size="4" variant="soft">
              Learn More
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
