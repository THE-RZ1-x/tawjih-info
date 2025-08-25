import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  // Prefer DATABASE_URL, fallback to prisma/dev.db for local dev
  const datasourceUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  const prisma = new PrismaClient({ datasourceUrl });

  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@tawjih.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  if (!password || password.length < 8) {
    console.error('ADMIN_PASSWORD must be provided and at least 8 characters.');
    process.exit(1);
  }

  try {
    console.log(`Using datasourceUrl=${datasourceUrl}`);
    console.log(`Checking existing admin for username="${username}" or email="${email}" ...`);
    const existing = await prisma.admin.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      console.log(`Admin already exists: ${existing.username} <${existing.email}>`);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { username, email, password: hashed },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    console.log('✅ Created admin:', admin);
  } catch (err) {
    console.error('❌ Failed to create admin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 