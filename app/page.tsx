"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-pink-950 dark:to-background">
    <div className="container mx-auto px-4 py-16">
      <nav className="flex justify-between items-center mb-16">
        <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400">CycleSync</h1>
        <div className="space-x-4">
        <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </Button>
        </div>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Track Your Cycle, Understand Your Body
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comprehensive menstrual cycle tracking with insights into your mood, energy,
            and overall well-being.
          </p>
          <Button  asChild>
            <Link href="/register">
              Get Started <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Cycle Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Log and predict your menstrual cycles with ease
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Symptom Logging</h3>
            <p className="text-sm text-muted-foreground">
              Track mood, energy, and physical symptoms
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Health Insights</h3>
            <p className="text-sm text-muted-foreground">
              Understand patterns in your cycle
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Smart Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Never miss tracking your cycle
            </p>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
}
