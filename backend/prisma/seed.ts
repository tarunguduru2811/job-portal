import { PrismaClient, Role, LocationType, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Create a Company and Employer
  const employer = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.com',
      password: 'password123', // In production, this would be hashed
      role: Role.EMPLOYER,
      name: 'Alice Recruiter',
      company: {
        create: {
          name: 'TechCorp Inc.',
          description: 'A leading technology company specializing in AI solutions.',
          isVerified: true
        }
      }
    },
    include: { company: true }
  });

  console.log('Created Employer and Company:', employer.company?.name);

  // 2. Create a Job Post
  const job = await prisma.jobPost.create({
    data: {
      title: 'Senior Frontend Engineer',
      description: 'Looking for a React/Next.js expert to build our new premium platform.',
      requirements: '5+ years experience, Next.js, TypeScript, Tailwind CSS',
      salaryRange: '$120k - $160k',
      locationType: LocationType.REMOTE,
      companyId: employer.companyId!
    }
  });

  console.log('Created Job Post:', job.title);

  // 3. Create Applicants and Applications
  const statuses = [
    ApplicationStatus.APPLIED, 
    ApplicationStatus.SCREENING, 
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.OFFER
  ];
  
  const applicants = [
    { email: 'bob@example.com', name: 'Bob Smith', skills: ['React', 'JavaScript'] },
    { email: 'charlie@example.com', name: 'Charlie Davis', skills: ['Next.js', 'TypeScript', 'Node.js'] },
    { email: 'diana@example.com', name: 'Diana Prince', skills: ['Vue', 'CSS', 'Figma'] },
    { email: 'evan@example.com', name: 'Evan Wright', skills: ['React', 'GraphQL'] }
  ];

  for (let i = 0; i < applicants.length; i++) {
    const seeker = await prisma.user.create({
      data: {
        email: applicants[i].email,
        password: 'password123',
        role: Role.JOB_SEEKER,
        name: applicants[i].name,
        skills: applicants[i].skills
      }
    });

    await prisma.application.create({
      data: {
        jobPostId: job.id,
        userId: seeker.id,
        status: statuses[i]
      }
    });
    console.log(`Created Applicant ${seeker.name} with status ${statuses[i]}`);
  }
  
  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
