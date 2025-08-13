// Custom 404 (Not Found) page for Next.js App Router
// This file is automatically used for unmatched routes.
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

export default function NotFound() {
	return (
		<main className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
			{/* Gradient blobs */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -left-24 top-1/3 h-80 w-80 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
				<div className="absolute -right-20 top-10 h-72 w-72 animate-pulse rounded-full bg-fuchsia-500/10 blur-3xl" />
				<div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 transform rounded-full bg-emerald-500/10 blur-3xl" />
			</div>

			<div className="mx-auto w-full max-w-xl">
				<div className="mb-8 flex items-center justify-center gap-3 text-sm font-medium tracking-wide text-indigo-500">
					<span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 backdrop-blur">404</span>
					<span className="text-neutral-500 dark:text-neutral-400">Page not found</span>
				</div>

				<h1 className="text-balance bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-500 sm:text-5xl">
					You just sailed off the map
				</h1>
				<p className="mt-6 text-pretty text-base leading-7 text-neutral-600 dark:text-neutral-400">
					The route you plotted doesn’t exist (yet). Check the URL, head back to safety, or explore a new destination.
				</p>

				<nav className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/"
						className="group inline-flex items-center gap-2 rounded-full border border-neutral-300/60 bg-white/60 px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm backdrop-blur transition hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
					>
						<span>Return Home</span>
						<span className="transition-transform group-hover:translate-x-0.5">→</span>
					</Link>
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-600/30 transition hover:from-indigo-500 hover:to-fuchsia-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:ring-indigo-500/40"
					>
						Dashboard
					</Link>
					<Link
						href="/contact"
						className="inline-flex items-center gap-2 rounded-full border border-neutral-300/60 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/70"
					>
						Contact Support
					</Link>
				</nav>

				{/* Fun mini ASCII compass */}
				<div className="pointer-events-none mx-auto mt-14 w-fit select-none text-[10px] font-mono leading-[10px] text-neutral-400 opacity-70 [text-wrap:balance]">
					<pre className="whitespace-pre text-center">
						{`    N\nW + E\n    S`}
					</pre>
				</div>
			</div>

			{/* Decorative faded logo (optional) */}
			<Suspense fallback={null}>
				<div className="pointer-events-none absolute inset-0 -z-20 flex items-center justify-center opacity-5 dark:opacity-[0.04]">
					<Image
						src="/XOLOG_LOGO.png"
						alt="XOLOG watermark"
						width={600}
						height={600}
						className="max-w-[60%] select-none object-contain"
						priority
					/>
				</div>
			</Suspense>
		</main>
	);
}

export const dynamic = 'force-static';
