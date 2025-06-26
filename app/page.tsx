// File: app/page.tsx
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-base-200 via-white to-base-100 px-6 py-12">
      <div className="max-w-3xl text-center space-y-6">
        {/* Logo or illustration */}
        <Image
          src="/logo.png"
          alt="EcoCruise Logo"
          width={72}
          height={72}
          className="mx-auto mb-2"
        />

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
          EcoCruise Admin Portal
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 text-lg md:text-xl">
          Centralized control for your campus mobility ecosystem. Monitor performance, manage routes, handle driver payouts, and resolve support tickets—all from a single interface.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left text-sm text-gray-700">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-primary">
            <h3 className="font-semibold text-primary mb-1">Operational Oversight</h3>
            <p>Track real-time ride data, revenue flows, and user activity with actionable insights.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-secondary">
            <h3 className="font-semibold text-secondary mb-1">User & Role Management</h3>
            <p>Ban, activate, or assign roles to users with secure access controls.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-accent">
            <h3 className="font-semibold text-accent mb-1">Driver Payout Automation</h3>
            <p>Review withdrawal requests, manage payout history, and maintain transparency.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-info">
            <h3 className="font-semibold text-info mb-1">Support & Resolution</h3>
            <p>Resolve tickets and provide support to customers and drivers instantly.</p>
          </div>
        </div>

        {/* Call-to-action */}
        <button
          onClick={() => router.push("/login")}
          className="btn btn-primary mt-8 px-6 py-3 text-lg font-semibold shadow-md hover:shadow-lg"
        >
          Enter Admin Panel
        </button>
      </div>
    </div>
  );
}
