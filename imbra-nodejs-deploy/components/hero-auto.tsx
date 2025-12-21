"use client";
import React from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './theme-toggle';
import CifEstimatorCard from './cif-estimator-card';

export default function HeroAuto(){
  return (
    <section className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-4xl font-semibold leading-tight">Find your next car. Pay locally.</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-slate-300">Browse verified stock in ZMW. Reserve via USSD. Deposit with Airtel/MTN.</p>
            <div className="mt-6 flex gap-3">
              <a href="/cars" className="px-5 py-3 rounded-2xl bg-primary text-white">Browse cars</a>
              <a href={`tel:${process.env.NEXT_PUBLIC_SALES_PHONE}`} className="px-4 py-3 rounded-2xl border">Call sales</a>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <div className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 font-mono">{process.env.NEXT_PUBLIC_USSD}</div>
              <div className="text-xs">Dial our USSD from any mobile to reserve</div>
            </div>
          </motion.div>
        </div>
        <div className="md:col-span-5">
          <div className="space-y-4">
            <CifEstimatorCard />
            <div className="bg-card p-4 rounded-2xl shadow border">
              <h4 className="font-semibold">USSD Preview</h4>
              <pre className="font-mono text-xs mt-2 bg-slate-900 text-slate-50 p-3 rounded">CON Welcome to Denuel
1) Type of cars
2) How make payment
3) Check Order
4) Next page
0) Help</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
