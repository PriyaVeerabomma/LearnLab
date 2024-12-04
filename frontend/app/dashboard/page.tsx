'use client';

import { useAuth } from "@/components/providers/auth-provider";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Dashboard page mounted', { user });
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Welcome to Dashboard, {user?.full_name || 'Loading...'}
      </h1>
    </div>
  );
}