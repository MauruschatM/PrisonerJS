"use client";

import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Code } from "@heroui/code";
import { Divider } from "@heroui/divider";
import Link from "next/link";

export default function Home() {
  const exampleStrategy = `function strategy(opponentHistory, myHistory, round) {
  // Tit-for-Tat: Kooperiere in der ersten Runde,
  // dann tue was der Gegner zuletzt getan hat
  if (round === 0) {
    return "C";
  }
  return opponentHistory[opponentHistory.length - 1];
}`;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Prisoner's Dilemma Tournament
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Programmieren Sie Ihre eigene Strategie für das berühmte Prisoner's
          Dilemma und treten Sie gegen andere Spieler in wöchentlichen
          Tournaments an!
        </p>
        <div className="flex gap-4 justify-center">
          <Button as={Link} href="/strategies" color="primary" size="lg">
            Strategie erstellen
          </Button>
          <Button as={Link} href="/tournaments" variant="bordered" size="lg">
            Tournaments ansehen
          </Button>
        </div>
      </section>

      {/* Game Rules */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Spielregeln</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Das Prisoner's Dilemma</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-gray-600">
                Zwei Spieler treffen gleichzeitig eine Entscheidung:{" "}
                <strong>Kooperieren (C)</strong> oder{" "}
                <strong>Defektieren (D)</strong>.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Beide kooperieren:</span>
                  <Chip color="success" variant="flat">
                    3 : 3 Punkte
                  </Chip>
                </div>
                <div className="flex justify-between">
                  <span>Einer defektiert:</span>
                  <Chip color="warning" variant="flat">
                    5 : 0 Punkte
                  </Chip>
                </div>
                <div className="flex justify-between">
                  <span>Beide defektieren:</span>
                  <Chip color="danger" variant="flat">
                    1 : 1 Punkte
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Tournament Format</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Chip color="primary" variant="flat">
                    Round Robin
                  </Chip>
                  <span className="text-sm">Jede Strategie gegen jede</span>
                </div>
                <div className="flex items-center gap-3">
                  <Chip color="secondary" variant="flat">
                    200 Runden
                  </Chip>
                  <span className="text-sm">Pro Spiel</span>
                </div>
                <div className="flex items-center gap-3">
                  <Chip color="success" variant="flat">
                    Samstag 20:00
                  </Chip>
                  <span className="text-sm">Automatische Tournaments</span>
                </div>
              </div>

              <Divider />

              <p className="text-sm text-gray-600">
                Alle aktiven Strategien nehmen automatisch teil. Der Gewinner
                ist die Strategie mit den meisten Gesamtpunkten.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Strategy Example */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Strategie-Beispiel
        </h2>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div>
              <h3 className="text-xl font-semibold">Tit-for-Tat Strategie</h3>
              <p className="text-gray-600 text-sm">
                Eine der erfolgreichsten Strategien: Beginne mit Kooperation,
                dann imitiere den letzten Zug des Gegners.
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <Code className="w-full">
              <pre className="text-sm overflow-x-auto p-4">
                {exampleStrategy}
              </pre>
            </Code>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tipp:</strong> Ihre Funktion erhält drei Parameter:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>
                  • <code>opponentHistory</code> - Array der Gegnerzüge ["C",
                  "D", "C", ...]
                </li>
                <li>
                  • <code>myHistory</code> - Array Ihrer bisherigen Züge
                </li>
                <li>
                  • <code>round</code> - Aktuelle Rundennummer (startet bei 0)
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* How to Start */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-8">Wie starten Sie?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold">Registrieren</h3>
              <p className="text-gray-600 text-sm">
                Erstellen Sie ein kostenloses Konto, um am Tournament
                teilzunehmen.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold">Strategie programmieren</h3>
              <p className="text-gray-600 text-sm">
                Schreiben Sie JavaScript-Code für Ihre Prisoner's Dilemma
                Strategie.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold">
                Am Tournament teilnehmen
              </h3>
              <p className="text-gray-600 text-sm">
                Ihre Strategie nimmt automatisch jeden Samstag am Tournament
                teil.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8">
          <Button as={Link} href="/auth" color="primary" size="lg">
            Jetzt starten
          </Button>
        </div>
      </section>
    </div>
  );
}
