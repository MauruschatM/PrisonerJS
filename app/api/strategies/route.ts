import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { strategy } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// Validate JavaScript code for Prisoner's Dilemma strategy
function validateStrategyCode(code: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Check if code contains required function
    if (
      !code.includes("function strategy(") &&
      !code.includes("const strategy = ") &&
      !code.includes("strategy =")
    ) {
      return {
        isValid: false,
        error: "Code must contain a 'strategy' function",
      };
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /process\./,
      /global\./,
      /console\./,
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /window\./,
      /document\./,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          isValid: false,
          error: `Dangerous pattern detected: ${pattern.source}`,
        };
      }
    }

    // Test if code can be parsed
    new Function(code);

    return { isValid: true };
  } catch (error: any) {
    return { isValid: false, error: `Syntax error: ${error.message}` };
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userStrategies = await db
      .select()
      .from(strategy)
      .where(eq(strategy.userId, session.user.id))
      .orderBy(strategy.createdAt);

    return NextResponse.json({ strategies: userStrategies });
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, code } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Validate code
    const validation = validateStrategyCode(code);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if user already has a strategy with this name
    const existingStrategy = await db
      .select()
      .from(strategy)
      .where(and(eq(strategy.userId, session.user.id), eq(strategy.name, name)))
      .limit(1);

    if (existingStrategy.length > 0) {
      return NextResponse.json(
        { error: "Strategy with this name already exists" },
        { status: 400 }
      );
    }

    const newStrategy = {
      id: generateId(),
      name,
      description: description || null,
      code,
      userId: session.user.id,
      isActive: true,
    };

    await db.insert(strategy).values(newStrategy);

    return NextResponse.json({ strategy: newStrategy }, { status: 201 });
  } catch (error) {
    console.error("Error creating strategy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description, code, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    // Validate code if provided
    if (code) {
      const validation = validateStrategyCode(code);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Check if strategy exists and belongs to user
    const existingStrategy = await db
      .select()
      .from(strategy)
      .where(and(eq(strategy.id, id), eq(strategy.userId, session.user.id)))
      .limit(1);

    if (existingStrategy.length === 0) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (code !== undefined) updateData.code = code;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(strategy)
      .set(updateData)
      .where(and(eq(strategy.id, id), eq(strategy.userId, session.user.id)));

    const updatedStrategy = await db
      .select()
      .from(strategy)
      .where(eq(strategy.id, id))
      .limit(1);

    return NextResponse.json({ strategy: updatedStrategy[0] });
  } catch (error) {
    console.error("Error updating strategy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
