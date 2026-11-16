import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: {
        progress: true,
      },
    });

    // Fallback static topics if database is empty before seed
    if (!topics || topics.length === 0) {
      return NextResponse.json({
        topics: [
          {
            id: 'top_1',
            title: 'Linear Equations',
            slug: 'linear-equations',
            category: 'Algebra',
            difficulty: 'Beginner',
            estDuration: 15,
            description: 'Solving 1-variable linear equations like 2x + 6 = 14',
            proficiency: 0.84,
          },
          {
            id: 'top_2',
            title: 'Factorisation',
            slug: 'factorisation',
            category: 'Algebra',
            difficulty: 'Intermediate',
            estDuration: 20,
            description: 'Factoring expressions, grouping, common factors, and quadratic difference of squares.',
            proficiency: 0.54,
          },
          {
            id: 'top_3',
            title: 'Quadratic Equations',
            slug: 'quadratic-equations',
            category: 'Algebra',
            difficulty: 'Intermediate',
            estDuration: 25,
            description: 'Solving x² + bx + c = 0 via factoring, roots, vertex, and quadratic formula.',
            proficiency: 0.37,
            recommended: true,
          },
          {
            id: 'top_4',
            title: 'Graphs & Functions',
            slug: 'graphs-functions',
            category: 'Algebra',
            difficulty: 'Intermediate',
            estDuration: 20,
            description: 'Plotting linear and quadratic curves, finding x-intercepts, y-intercepts, and vertices.',
            proficiency: 0.61,
          },
        ],
      });
    }

    return NextResponse.json({ topics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
