"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-client";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Code } from "@heroui/code";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Switch } from "@heroui/switch";
import { formatDate } from "@/shared/utils";

interface Strategy {
	id: string;
	name: string;
	description: string | null;
	code: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export default function StrategiesPage() {
	const { user, isLoading } = useAuth();
	const [strategies, setStrategies] = useState<Strategy[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

	// Form state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [code, setCode] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Example strategy code
	const exampleCode = `// Beispielstrategie: Tit-for-Tat
function strategy(opponentHistory, myHistory, round) {
  // Erste Runde: Kooperieren
  if (round === 0) {
    return "C";
  }
  
  // Alle anderen Runden: Tu was der Gegner zuletzt getan hat
  return opponentHistory[opponentHistory.length - 1];
}`;

	useEffect(() => {
		if (user) {
			fetchStrategies();
		}
	}, [user]);

	const fetchStrategies = async () => {
		try {
			const response = await fetch("/api/strategies");
			if (response.ok) {
				const data = await response.json();
				setStrategies(data.strategies);
			}
		} catch (error) {
			console.error("Error fetching strategies:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		try {
			const url = editingStrategy ? "/api/strategies" : "/api/strategies";
			const method = editingStrategy ? "PUT" : "POST";
			const body = editingStrategy
				? { id: editingStrategy.id, name, description, code }
				: { name, description, code };

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (response.ok) {
				await fetchStrategies();
				resetForm();
				setShowForm(false);
			} else {
				setError(data.error || "Ein Fehler ist aufgetreten");
			}
		} catch (error) {
			setError("Netzwerkfehler");
		} finally {
			setSubmitting(false);
		}
	};

	const resetForm = () => {
		setName("");
		setDescription("");
		setCode("");
		setEditingStrategy(null);
		setError("");
	};

	const handleEdit = (strategy: Strategy) => {
		setEditingStrategy(strategy);
		setName(strategy.name);
		setDescription(strategy.description || "");
		setCode(strategy.code);
		setShowForm(true);
	};

	const toggleActive = async (strategy: Strategy) => {
		try {
			const response = await fetch("/api/strategies", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: strategy.id,
					isActive: !strategy.isActive,
				}),
			});

			if (response.ok) {
				await fetchStrategies();
			}
		} catch (error) {
			console.error("Error toggling strategy:", error);
		}
	};

	if (isLoading) {
		return <div className="flex justify-center p-8">Laden...</div>;
	}

	if (!user) {
		return (
			<div className="flex justify-center p-8">
				<Card>
					<CardBody>
						<p>Bitte melden Sie sich an, um Strategien zu verwalten.</p>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Prisoner's Dilemma Strategien</h1>
				<p className="text-gray-600 mb-6">
					Erstellen Sie Ihre eigenen Strategien für das Prisoner's Dilemma. Jeden Samstagabend werden alle
					aktiven Strategien in einem Tournament gegeneinander antreten.
				</p>

				<Card className="mb-6">
					<CardHeader>
						<h3 className="text-lg font-semibold">Spielregeln</h3>
					</CardHeader>
					<CardBody>
						<div className="space-y-2">
							<p>
								<strong>Kooperieren (C):</strong> Beide bekommen 3 Punkte
							</p>
							<p>
								<strong>Einer defektiert (D), einer kooperiert (C):</strong> Defektierer: 5 Punkte,
								Kooperierender: 0 Punkte
							</p>
							<p>
								<strong>Beide defektieren (D):</strong> Beide bekommen 1 Punkt
							</p>
							<Divider className="my-4" />
							<p className="text-sm text-gray-600">
								Ihre Strategie-Funktion erhält die Historie des Gegners, Ihre eigene Historie und die aktuelle
								Rundennummer. Sie muss "C" (Kooperieren) oder "D" (Defektieren) zurückgeben.
							</p>
						</div>
					</CardBody>
				</Card>

				<Button
					color="primary"
					onClick={() => {
						resetForm();
						setShowForm(!showForm);
					}}>
					{showForm ? "Abbrechen" : "Neue Strategie erstellen"}
				</Button>
			</div>

			{showForm && (
				<Card className="mb-8">
					<CardHeader>
						<h2 className="text-xl font-semibold">
							{editingStrategy ? "Strategie bearbeiten" : "Neue Strategie"}
						</h2>
					</CardHeader>
					<CardBody>
						<form onSubmit={handleSubmit} className="space-y-4">
							<Input
								label="Name"
								value={name}
								onChange={e => setName(e.target.value)}
								required
								placeholder="z.B. Tit-for-Tat"
							/>

							<Input
								label="Beschreibung (optional)"
								value={description}
								onChange={e => setDescription(e.target.value)}
								placeholder="Kurze Beschreibung Ihrer Strategie"
							/>

							<div>
								<label className="block text-sm font-medium mb-2">JavaScript Code</label>
								<textarea
									value={code}
									onChange={e => setCode(e.target.value)}
									placeholder={exampleCode}
									className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
									required
								/>
							</div>

							{error && <div className="text-red-600 text-sm">{error}</div>}

							<div className="flex gap-2">
								<Button type="submit" color="primary" isLoading={submitting}>
									{editingStrategy ? "Aktualisieren" : "Erstellen"}
								</Button>
								<Button
									type="button"
									variant="light"
									onClick={() => {
										resetForm();
										setShowForm(false);
									}}>
									Abbrechen
								</Button>
							</div>
						</form>
					</CardBody>
				</Card>
			)}

			<div className="space-y-4">
				<h2 className="text-2xl font-semibold">Ihre Strategien</h2>

				{loading ? (
					<div className="text-center py-8">Strategien werden geladen...</div>
				) : strategies.length === 0 ? (
					<Card>
						<CardBody>
							<p className="text-center text-gray-600">
								Sie haben noch keine Strategien erstellt. Erstellen Sie Ihre erste Strategie!
							</p>
						</CardBody>
					</Card>
				) : (
					strategies.map(strategy => (
						<Card key={strategy.id}>
							<CardHeader className="flex justify-between items-start">
								<div>
									<h3 className="text-lg font-semibold">{strategy.name}</h3>
									{strategy.description && <p className="text-gray-600 text-sm">{strategy.description}</p>}
								</div>
								<div className="flex items-center gap-2">
									<Chip color={strategy.isActive ? "success" : "default"} variant="flat">
										{strategy.isActive ? "Aktiv" : "Inaktiv"}
									</Chip>
									<Switch isSelected={strategy.isActive} onChange={() => toggleActive(strategy)} />
								</div>
							</CardHeader>
							<CardBody>
								<div className="space-y-4">
									<Code className="w-full">
										<pre className="text-xs overflow-x-auto">
											{strategy.code.substring(0, 200)}
											{strategy.code.length > 200 && "..."}
										</pre>
									</Code>

									<div className="flex justify-between items-center">
										<div className="text-sm text-gray-600">
											Erstellt: {formatDate(strategy.createdAt)}
											{strategy.updatedAt !== strategy.createdAt && (
												<span> • Aktualisiert: {formatDate(strategy.updatedAt)}</span>
											)}
										</div>
										<Button size="sm" variant="light" onClick={() => handleEdit(strategy)}>
											Bearbeiten
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
