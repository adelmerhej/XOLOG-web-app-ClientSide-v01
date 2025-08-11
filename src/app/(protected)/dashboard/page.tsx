"use client";

import React from 'react';
import AppLayout from '@/components/layout/Layout';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold">$128K</p>
          <p className="text-xs text-slate-500 mt-1">+12% vs last month</p>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Shipments</h3>
          <p className="text-3xl font-bold">342</p>
          <p className="text-xs text-slate-500 mt-1">On track</p>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Pending Invoices</h3>
          <p className="text-3xl font-bold">18</p>
          <p className="text-xs text-slate-500 mt-1">Due this week</p>
        </div>
      </div>
    </AppLayout>
  );
}