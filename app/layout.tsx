import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/app/lib/site";
import { fontSans } from "@/app/lib/fonts";
import { Navbar } from "@/app/components/navbar";

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "black" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html suppressHydrationWarning lang="en" className="dark">
			<head />
			<body className={clsx("min-h-screen bg-black text-white font-sans antialiased", fontSans.className)}>
				<Providers>
					<div className="relative flex flex-col min-h-screen bg-black">
						<Navbar />
						<main className="flex-grow w-full">{children}</main>
						<footer className="w-full flex items-center justify-center py-6 border-t border-gray-800 bg-black">
							<Link
								isExternal
								className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
								href="https://heroui.com?utm_source=next-app-template"
								title="heroui.com homepage">
								<span>Powered by</span>
								<span className="text-white font-medium">HeroUI</span>
							</Link>
						</footer>
					</div>
				</Providers>
			</body>
		</html>
	);
}
