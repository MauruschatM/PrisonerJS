import { auth } from "@/server/auth/config";

export async function GET(request: Request) {
	return auth.handler(request);
}

export async function POST(request: Request) {
	return auth.handler(request);
}
