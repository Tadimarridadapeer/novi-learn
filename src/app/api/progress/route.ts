import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        sessions: {
          include: {
            messages: true,
          },
        },
        progress: true,
      },
    });

    const sessions = await prisma.tutorSession.findMany({
      include: {
        topic: true,
        messages: true,
        events: true,
      },
    });

    // Calculate dynamic proficiencies per topic based on stored StudentProgress & TutorSessions
    const topicProficiencies = topics.map((t) => {
      const topicSessions = sessions.filter((s) => s.topicId === t.id);
      
      // Calculate level strictly from student activity in database
      let level = 0;
      if (t.progress && t.progress.length > 0) {
        const avgProf = t.progress.reduce((acc, p) => acc + p.proficiency, 0) / t.progress.length;
        level = Math.min(100, Math.round(avgProf * 100));
      } else if (topicSessions.length > 0) {
        const totalScore = topicSessions.reduce((acc, s) => acc + s.confidenceScore, 0);
        level = Math.min(100, Math.round((totalScore / topicSessions.length) * 100));
      }

      let status = 'Not Yet Mastered';
      let color = 'bg-slate-400';

      if (level >= 85) {
        status = 'Concept Mastered ✓';
        color = 'bg-emerald-500';
      } else if (level >= 60) {
        status = 'Proficient';
        color = 'bg-teal-500';
      } else if (level >= 25) {
        status = 'Improving';
        color = 'bg-amber-500';
      } else if (level > 0) {
        status = 'Learning';
        color = 'bg-brand-600';
      }

      return {
        id: t.id,
        title: t.title,
        slug: t.slug,
        level,
        status,
        color,
        sessionsCount: topicSessions.length,
      };
    });

    // Extract real mistakes from session events
    const mistakesHistory: { type: string; topic: string; date: string; count: number }[] = [];
    sessions.forEach((s) => {
      const mistakeEvs = s.events.filter((e) => e.eventType === 'MISTAKE_DETECTED');
      mistakeEvs.forEach((e) => {
        try {
          const payload = JSON.parse(e.payload);
          if (payload.mistake) {
            mistakesHistory.push({
              type: payload.mistake,
              topic: s.topic.title,
              date: new Date(e.createdAt).toLocaleDateString(),
              count: 1,
            });
          }
        } catch (err) {
          // fallback
        }
      });
    });

    return NextResponse.json({
      success: true,
      skills: topicProficiencies,
      mistakesHistory,
      totalSessions: sessions.length,
    });
  } catch (err: any) {
    console.error('Progress API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
