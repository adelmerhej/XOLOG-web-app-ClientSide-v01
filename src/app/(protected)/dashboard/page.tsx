"use client";

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/Layout';
import { fetchTotalToBeLoadedCount, fetchTotalOnWaterCount, fetchTotalUnderClearanceCount, fetchTotalInvoicesCount } from '@/app/api/client/dashboard/DashboardMetricsApiClient';

export default function Dashboard() {
  const [toBeLoadedCount, setToBeLoadedCount] = useState<number | null>(null);
  const [onWaterCount, setOnWaterCount] = useState<number | null>(null);
  const [underClearanceCount, setUnderClearanceCount] = useState<number | null>(null);
  const [invoicesCount, setInvoicesCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const [tobe, water, under, invoices] = await Promise.all([
        fetchTotalToBeLoadedCount(),
        fetchTotalOnWaterCount(),
        fetchTotalUnderClearanceCount(),
        fetchTotalInvoicesCount(),
      ]);
      setToBeLoadedCount(tobe);
      setOnWaterCount(water);
      setUnderClearanceCount(under);
      setInvoicesCount(invoices);
    };
    load();
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-4">
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Total shipments to be loaded</h3>
          <p className="text-3xl font-bold">{toBeLoadedCount ?? '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Latest status</p>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Total shipments on water</h3>
          <p className="text-3xl font-bold">{onWaterCount ?? '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Latest status</p>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Total shipments under clearance</h3>
          <p className="text-3xl font-bold">{underClearanceCount ?? '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Latest status</p>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 shadow-sm border border-sky-100 dark:border-slate-700">
          <h3 className="font-semibold text-sky-600 dark:text-sky-300 mb-2">Total invoices</h3>
          <p className="text-3xl font-bold">{invoicesCount ?? '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Latest status</p>
        </div>
      </div>
    </AppLayout>
  );
}