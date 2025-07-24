"use client";

import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import NextLink from "next/link";

import { useSession, signOut } from "@/app/lib/auth-client";

export const Navbar = () => {
	const { data: session, isPending } = useSession();

	return (
		<HeroUINavbar
			maxWidth="full"
			className="bg-black border-b border-gray-800 backdrop-blur-none"
			classNames={{
				wrapper: "px-6 max-w-7xl mx-auto",
			}}>
			<NavbarContent justify="start">
				<NavbarBrand>
					<NextLink href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
						<div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
							<span className="text-black font-bold text-lg">P</span>
						</div>
						<span className="text-white text-xl font-light tracking-wide">PrisonerJS</span>
					</NextLink>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent justify="center" className="hidden sm:flex">
				<NavbarItem>
					<NextLink href="/game" className="text-gray-300 hover:text-white transition-colors font-medium">
						Spiel
					</NextLink>
				</NavbarItem>
				<NavbarItem>
					<NextLink href="/stats" className="text-gray-300 hover:text-white transition-colors font-medium">
						Statistiken
					</NextLink>
				</NavbarItem>
			</NavbarContent>

			<NavbarContent justify="end">
				<NavbarItem>
					{isPending ? (
						<Button size="sm" variant="bordered" isLoading className="border-gray-600 text-gray-300">
							Laden...
						</Button>
					) : session ? (
						<div className="flex items-center gap-4">
							<span className="text-gray-300 text-sm hidden lg:block">
								{session.user.name || session.user.email}
							</span>
							<Button
								size="sm"
								variant="bordered"
								className="border-gray-600 text-gray-300 hover:bg-gray-900"
								onPress={async () => {
									await signOut();
									setTimeout(() => {
										window.location.href = "/";
									}, 100);
								}}>
								Abmelden
							</Button>
						</div>
					) : (
						<Button
							as={NextLink}
							href="/auth"
							size="sm"
							className="bg-white text-black hover:bg-gray-200 font-medium">
							Anmelden
						</Button>
					)}
				</NavbarItem>
			</NavbarContent>
		</HeroUINavbar>
	);
};
