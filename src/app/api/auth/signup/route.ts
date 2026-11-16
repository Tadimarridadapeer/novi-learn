import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const user = await prisma.user.create({
      data: {
        email,
        name: name || 'Student User',
        role: 'student',
        profile: {
          create: {
            gradeLevel: 'High School',
            overallConfidence: 0.5,
          }
        }
      },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
