import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Quick fallback/demo login support
    let user = await prisma.user.findUnique({
      where: { email: email || 'alex@student.novilearn.edu' },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || 'alex@student.novilearn.edu',
          name: email ? email.split('@')[0] : 'Alex Johnson',
          role: 'student',
          profile: {
            create: {
              gradeLevel: 'High School',
              overallConfidence: 0.0,
            }
          }
        },
        include: { profile: true },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
