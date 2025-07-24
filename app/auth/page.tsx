"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { signIn, signUp } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (isLogin) {
				const result = await signIn.email({
					email,
					password,
				});

				if (result.error) {
					setError("E-Mail oder Passwort ist falsch");
					return;
				}
			} else {
				const result = await signUp.email({
					email,
					password,
					name,
				});

				if (result.error) {
					setError("Registrierung fehlgeschlagen. E-Mail bereits vergeben?");
					return;
				}
			}

			// Kleine Verzögerung für Cookie-Synchronisation
			setTimeout(() => {
				window.location.href = "/";
			}, 100);
		} catch (err: any) {
			console.error("Auth error:", err);
			setError(
				isLogin
					? "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut."
					: "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-[60vh]">
			<div className="w-full max-w-md bg-content1 rounded-large shadow-medium p-6">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-foreground">{isLogin ? "Anmelden" : "Registrieren"}</h1>
					<p className="text-small text-default-500 mt-2">
						{isLogin ? "Melde dich mit deinem Account an" : "Erstelle einen neuen Account"}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{!isLogin && (
						<Input
							type="text"
							label="Name"
							placeholder="Dein Name"
							value={name}
							onChange={e => setName(e.target.value)}
							required
						/>
					)}
					<Input
						type="email"
						label="E-Mail"
						placeholder="deine@email.com"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
					<Input
						type="password"
						label="Passwort"
						placeholder="Dein Passwort"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
					/>
					{error && <p className="text-danger text-small">{error}</p>}
					<Button type="submit" color="primary" isLoading={loading} className="w-full">
						{isLogin ? "Anmelden" : "Registrieren"}
					</Button>
				</form>

				<div className="flex justify-center mt-4">
					<Button variant="light" color="primary" onPress={() => setIsLogin(!isLogin)}>
						{isLogin ? "Noch kein Account? Registrieren" : "Bereits ein Account? Anmelden"}
					</Button>
				</div>
			</div>
		</div>
	);
}
