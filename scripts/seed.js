const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Novi Learn database...');

  // Create default student user
  const user = await prisma.user.upsert({
    where: { email: 'alex@student.novilearn.edu' },
    update: {},
    create: {
      email: 'alex@student.novilearn.edu',
      name: 'Alex Johnson',
      role: 'student',
      profile: {
        create: {
          gradeLevel: 'High School (Grade 10)',
          preferredLearning: 'guided_discovery',
          overallConfidence: 0.62,
        },
      },
    },
    include: { profile: true },
  });

  console.log('User created/verified:', user.email);

  // Subject
  const mathSubject = await prisma.subject.upsert({
    where: { slug: 'mathematics' },
    update: {},
    create: {
      name: 'Mathematics',
      slug: 'mathematics',
      description: 'Master algebra, equations, factorisation, quadratics, and graphing with an AI tutor.',
    },
  });

  // Topics
  const topicsData = [
    {
      title: 'Linear Equations',
      slug: 'linear-equations',
      category: 'Algebra',
      difficulty: 'Beginner',
      estDuration: 15,
      order: 1,
      description: 'Solving 1-variable linear equations like 2x + 6 = 14 and manipulating algebraic expressions.',
      proficiency: 0.84,
    },
    {
      title: 'Factorisation',
      slug: 'factorisation',
      category: 'Algebra',
      difficulty: 'Intermediate',
      estDuration: 20,
      order: 2,
      description: 'Factoring algebraic expressions, grouping, common factors, and difference of squares.',
      proficiency: 0.54,
    },
    {
      title: 'Quadratic Equations',
      slug: 'quadratic-equations',
      category: 'Algebra',
      difficulty: 'Intermediate',
      estDuration: 25,
      order: 3,
      description: 'Solving x² + bx + c = 0 via factoring, roots, vertex, and quadratic formula.',
      proficiency: 0.37,
    },
    {
      title: 'Graphs & Functions',
      slug: 'graphs-functions',
      category: 'Algebra',
      difficulty: 'Intermediate',
      estDuration: 20,
      order: 4,
      description: 'Plotting linear and quadratic curves, finding x-intercepts, y-intercepts, and vertices.',
      proficiency: 0.61,
    },
  ];

  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        subjectId: mathSubject.id,
        title: t.title,
        slug: t.slug,
        category: t.category,
        difficulty: t.difficulty,
        estDuration: t.estDuration,
        order: t.order,
        description: t.description,
      },
    });

    if (user.profile) {
      await prisma.studentProgress.upsert({
        where: {
          profileId_topicId: {
            profileId: user.profile.id,
            topicId: topic.id,
          },
        },
        update: { proficiency: t.proficiency },
        create: {
          profileId: user.profile.id,
          topicId: topic.id,
          proficiency: t.proficiency,
          sessionsCount: 3,
        },
      });
    }

    // Seed sample question for Quadratic Equations
    if (t.slug === 'quadratic-equations') {
      await prisma.question.create({
        data: {
          topicId: topic.id,
          problemText: 'Solve the quadratic equation x² + 5x + 6 = 0',
          latex: 'x^2 + 5x + 6 = 0',
          solution: 'x = -2 or x = -3',
          hints: JSON.stringify([
            'Find two numbers that multiply to 6 and add up to 5.',
            'The numbers are 2 and 3 because 2 × 3 = 6 and 2 + 3 = 5.',
            'Rewrite as (x + 2)(x + 3) = 0 and solve for x.',
          ]),
          expectedSteps: JSON.stringify([
            'Identify coefficients: a=1, b=5, c=6',
            'Find factor pair for 6 that sums to 5: (2, 3)',
            'Factor expression: (x + 2)(x + 3) = 0',
            'Set each factor to zero: x + 2 = 0 => x = -2; x + 3 = 0 => x = -3',
          ]),
          difficulty: 'Medium',
        },
      });
    }
  }

  // Seed sample mistakes
  if (user.profile) {
    await prisma.studentMistake.createMany({
      data: [
        {
          profileId: user.profile.id,
          category: 'sign_errors',
          description: 'Flipping signs when isolating terms in equations',
          example: 'x + 3 = 5 => x = 5 + 3 (should be 5 - 3)',
          count: 4,
        },
        {
          profileId: user.profile.id,
          category: 'factor_selection',
          description: 'Choosing factor pairs that multiply to c but sum to wrong value',
          example: 'For c=6, choosing 1 and 6 instead of 2 and 3 when b=5',
          count: 3,
        },
      ],
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
