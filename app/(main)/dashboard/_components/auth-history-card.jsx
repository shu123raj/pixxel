"use client";

import React from "react";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

export function AuthHistoryCard() {
  const { data: authHistory, isLoading } = useConvexQuery(api.users.getAuthHistory);
  const { data: authStats } = useConvexQuery(api.users.getAuthStats);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-white shadow-lg shadow-slate-950/20">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="h-4 bg-white/10 rounded mb-2"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const recentEvents = authHistory?.slice(0, 5) || [];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-white shadow-lg shadow-slate-950/20">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-semibold">Authentication History</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-cyan-400">{authStats?.totalSignIns || 0}</p>
          <p className="text-sm text-white/60">Total Sign-ins</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-violet-400">{authStats?.totalSignUps || 0}</p>
          <p className="text-sm text-white/60">Total Sign-ups</p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Recent Activity
        </h4>
        {recentEvents.length === 0 ? (
          <p className="text-white/50 text-sm">No authentication events yet</p>
        ) : (
          recentEvents.map((event) => (
            <div
              key={event._id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                {event.eventType === "sign_in" ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Shield className="h-4 w-4 text-blue-400" />
                )}
                <div>
                  <p className="text-sm font-medium capitalize">
                    {event.eventType.replace("_", " ")}
                  </p>
                  <p className="text-xs text-white/50">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {event.success ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {authStats?.lastSignIn && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="h-4 w-4" />
            Last sign-in: {formatTimestamp(authStats.lastSignIn)}
          </div>
        </div>
      )}
    </div>
  );
}