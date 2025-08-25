import { PrismaClient } from '@prisma/client';

// Hardcode the database URL
process.env.DATABASE_URL = 'file:./prisma/dev.db';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with simple script...');

  try {
    // Sample School Guidance
    const guidance = {
      title_ar: "دليل التوجيه الجامعي 2024-2025",
      slug_ar: "دليل-التوجيه-الجامعي-2024-2025",
      body_ar: "الدليل الشامل للتوجيه الجامعي للسنة الدراسية 2024-2025، يشمل جميع الشعب والمسالك الجامعية المتاحة بالمؤسسات الجامعية المغربية.",
      sector: "التعليم العالي",
      region: "وطني",
      pdf_url: "https://example.com/university-guide-2024.pdf",
      featured: true,
      published: true
    };

    const result = await prisma.schoolGuidance.create({
      data: guidance
    });

    console.log('✅ Successfully created guidance entry:', result.title_ar);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
