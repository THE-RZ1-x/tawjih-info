import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '../prisma/.env' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Ensure default admin exists
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tawjih.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await prisma.admin.findFirst({
    where: {
      OR: [
        { username: adminUsername },
        { email: adminEmail },
      ],
    },
  });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        password: hashed,
      },
    });
    console.log(`✅ Created default admin: ${adminUsername} / ${adminEmail}`);
  } else {
    console.log('ℹ️ Admin already exists, skipping creation');
  }

  // Clear existing data
  await prisma.seoMeta.deleteMany();
  await prisma.heroImage.deleteMany();
  await prisma.examCalendar.deleteMany();
  await prisma.schoolGuidance.deleteMany();
  await prisma.jobCompetition.deleteMany();

  // Sample Job Competitions
  const jobCompetitions = [
    {
      title_ar: "مباراة توظيف تقنيين في وزارة التربية الوطنية",
      slug_ar: "مباراة-توظيف-تقنيين-وزارة-التربية-الوطنية",
      body_ar: "تعلن وزارة التربية الوطنية عن فتح باب الترشيح لمباراة توظيف تقنيين من الدرجة الثالثة، تخصص هندسة المعلوماتية. يشمل الانتداب 50 منصباً شاغراً بمختلف الأكاديميات الجهوية للتربية والتكوين. المباراة ستجرى على مرحلتين: اختبار كتابي واختبار شفوي. آخر أجل للتقديم هو 15 يناير 2025.",
      sector: "التربية والتكوين",
      region: "الرباط",
      closing_date: "2025-01-15",
      pdf_url: "https://example.com/tech-education-jobs.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "مباراة توظيف تقنيين في وزارة التربية الوطنية 2025",
        description: "مباراة توظيف 50 تقني من الدرجة الثالثة في وزارة التربية الوطنية. آخر أجل للتقديم 15 يناير 2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=800&h=400&fit=crop",
        alt_text: "مباراة توظيف تقنيين في وزارة التربية الوطنية"
      }
    },
    {
      title_ar: "مباراة توظيف أطر إدارية في الوزارة الأولى",
      slug_ar: "مباراة-توظيف-أطر-إدارية-الوزارة-الأولى",
      body_ar: "فتح باب الترشيح لمباراة توظيف أطر إدارية من الدرجة الأولى بالوزارة الأولى. تشمل المباراة 20 منصباً في مختلف المصالح الإدارية. يشترط في المرشحين الحصول على شهادة الإجازة في العلوم الإدارية أو تخصصات مقبولة مع خبرة لا تقل عن 3 سنوات. المباراة تشمل اختباراً كتابياً وآخر شفوياً.",
      sector: "الإدارة العامة",
      region: "الرباط",
      closing_date: "2025-01-20",
      pdf_url: "https://example.com/admin-frames.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "مباراة توظيف أطر إدارية في الوزارة الأولى 2025",
        description: "مباراة توظيف 20 إطاراً إدارياً من الدرجة الأولى بالوزارة الأولى. آخر أجل للتقديم 20 يناير 2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1450101499163-c8848c71ca85?w=800&h=400&fit=crop",
        alt_text: "مباراة توظيف أطر إدارية في الوزارة الأولى"
      }
    },
    {
      title_ar: "مباراة توظيف أطباء في وزارة الصحة",
      slug_ar: "مباراة-توظيف-أطباء-وزارة-الصحة",
      body_ar: "تعلن وزارة الصحة عن حاجتها لتوظيف 100 طبيب عام و50 طبيب اختصاصي للمستشفيات العمومية عبر التراب الوطني. يشترط في المرشحين الحصول على شهادة الطب ومزاولة المهنة لمدة سنة على الأقل. الترشيح مفتوح حتى 30 يناير 2025.",
      sector: "الصحة",
      region: "جميع الجهات",
      closing_date: "2025-01-30",
      pdf_url: "https://example.com/doctors-health.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "مباراة توظيف أطباء في وزارة الصحة 2025",
        description: "مباراة توظيف 150 طبيباً عاماً واختصاصيين في وزارة الصحة. آخر أجل للتقديم 30 يناير 2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop",
        alt_text: "مباراة توظيف أطباء في وزارة الصحة"
      }
    },
    {
      title_ar: "مباراة توظيف مهندسين في وزارة التجهيز",
      slug_ar: "مباراة-توظيف-مهندسين-وزارة-التجهيز",
      body_ar: "فتح باب الترشيح لمباراة توظيف 30 مهندساً في تخصصات مختلفة (مدني، كهرباء، ميكانيك) لوزارة التجهيز والنقل واللوجستيك. يشترط في المرشحين الحصول على شهادة مهندس الدولة مع خبرة لا تقل عن سنتين. المباراة ستجرى على مرحلتين.",
      sector: "التجهيز والنقل",
      region: "الرباط",
      closing_date: "2025-02-05",
      pdf_url: "https://example.com/engineers-equipment.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "مباراة توظيف مهندسين في وزارة التجهيز 2025",
        description: "مباراة توظيف 30 مهندساً في وزارة التجهيز والنقل واللوجستيك. آخر أجل للتقديم 5 فبراير 2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop",
        alt_text: "مباراة توظيف مهندسين في وزارة التجهيز"
      }
    },
    {
      title_ar: "مباراة توظيف محامين في وزارة العدل",
      slug_ar: "مباراة-توظيف-محامين-وزارة-العدل",
      body_ar: "تعلن وزارة العدل عن فتح باب الترشيح لمباراة توظيف 25 محامياً للمصالح القضائية. يشترط في المرشحين الحصول على شهادة الإجازة في القانون ومزاولة المهنة لمدة 3 سنوات. الترشيح مفتوح حتى 10 فبراير 2025.",
      sector: "العدل",
      region: "الرباط",
      closing_date: "2025-02-10",
      pdf_url: "https://example.com/lawyers-justice.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "مباراة توظيف محامين في وزارة العدل 2025",
        description: "مباراة توظيف 25 محامياً للمصالح القضائية بوزارة العدل. آخر أجل للتقديم 10 فبراير 2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=400&fit=crop",
        alt_text: "مباراة توظيف محامين في وزارة العدل"
      }
    }
  ];

  // Sample School Guidance
  const schoolGuidance = [
    {
      title_ar: "دليل التوجيه الجامعي 2024-2025",
      slug_ar: "دليل-التوجيه-الجامعي-2024-2025",
      body_ar: "الدليل الشامل للتوجيه الجامعي للسنة الدراسية 2024-2025، يشمل جميع الشعب والمسالك الجامعية المتاحة بالمؤسسات الجامعية المغربية. يحتوي الدليل على معلومات مفصلة عن الشروط اللازمة للالتحاق بكل مسلك، والمواد الدراسية، وآفاق الشغل، ونظام الدراسة. كما يقدم نصائح هامة لاختيار التوجيه المناسب حسب ميول وقدرات كل تلميذ.",
      sector: "التعليم العالي",
      region: "وطني",
      pdf_url: "https://example.com/university-guide-2024.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "دليل التوجيه الجامعي 2024-2025",
        description: "الدليل الشامل للتوجيه الجامعي للسنة الدراسية 2024-2025. يشمل جميع الشعب والمسالك الجامعية"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop",
        alt_text: "دليل التوجيه الجامعي 2024-2025"
      }
    },
    {
      title_ar: "نتائج الانتقال الإعدادي إلى الثانوي التأهيلي",
      slug_ar: "نتائج-الانتقال-الإعدادي-إلى-الثانوي-التأهيلي",
      body_ar: "الإعلان عن نتائج الانتقال من السلك الإعدادي إلى السلك الثانوي التأهيلي للسنة الدراسية 2024-2025. تشمل النتائج جميع المؤسسات التعليمية على المستوى الوطني. يمكن للتلاميذ وأوليائهم الاطلاع على النتائج عبر البوابة الإلكترونية للوزارة أو على مستوى المؤسسات التعليمية. كما يوضح هذا الدليل الإجراءات الواجب اتباعها للتسجيل في السلك الثانوي.",
      sector: "التعليم الثانوي",
      region: "جميع الجهات",
      pdf_url: "https://example.com/transition-results.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "نتائج الانتقال الإعدادي إلى الثانوي التأهيلي 2024",
        description: "نتائج الانتقال من السلك الإعدادي إلى الثانوي التأهيلي للسنة الدراسية 2024-2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
        alt_text: "نتائج الانتقال الإعدادي إلى الثانوي التأهيلي"
      }
    },
    {
      title_ar: "شعب الباكالوريا العلمية والتقنية",
      slug_ar: "شعب-الباكالوريا-العلمية-والتقنية",
      body_ar: "دليل مفصل حول شعب الباكالوريا العلمية والتقنية المتاحة في المغرب. يشمل الدليل شرحاً لمكونات كل شعبة (علوم تجريبية، رياضيات، علوم وتقنيات كهربائية، علوم وتقنيات ميكانيكية) والمواد الدراسية لكل شعبة، وشروط الالتحاق، والآفاق المهنية والتكوينية بعد الباكالوريا. كما يقدم نصائح لاختيار الشعبة المناسبة حسب الميول والقدرات.",
      sector: "التعليم الثانوي",
      region: "وطني",
      pdf_url: "https://example.com/scientific-bac-streams.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "شعب الباكالوريا العلمية والتقنية",
        description: "دليل مفصل حول شعب الباكالوريا العلمية والتقنية المتاحة في المغرب"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop",
        alt_text: "شعب الباكالوريا العلمية والتقنية"
      }
    },
    {
      title_ar: "التوجيه نحو التكوين المهني",
      slug_ar: "التوجيه-نحو-التكوين-المهني",
      body_ar: "دليل شامل حول التكوين المهني بالمغرب وآفاقه. يشمل الدليل معلومات عن مختلف التخصصات المهنية المتاحة (صناعية، خدماتية، فلاحية)، ومؤسسات التكوين المعتمدة، وشروط الالتحاق، ومدد التكوين، وشهادات التخرج. كما يقدم معلومات عن فرص الشغل بعد التكوين وإمكانية إنشاء المشاريع الخاصة.",
      sector: "التكوين المهني",
      region: "وطني",
      pdf_url: "https://example.com/vocational-training.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "التوجيه نحو التكوين المهني",
        description: "دليل شامل حول التكوين المهني بالمغرب وآفاقه"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1543857778-c4a1a569e7bd?w=800&h=400&fit=crop",
        alt_text: "التوجيه نحو التكوين المهني"
      }
    },
    {
      title_ar: "المنح الدراسية الجامعية 2024-2025",
      slug_ar: "المنح-الدراسية-الجامعية-2024-2025",
      body_ar: "دليل شامل حول المنح الدراسية الجامعية للسنة 2024-2025. يشمل الدليل معلومات عن مختلف أنواع المنح المتاحة (منحة اجتماعية، منحة استحقاق، منحة التفوق)، وشروط الاستفادة من كل منحة، ومبلغ كل منحة، وإجراءات التقديم، والمستندات المطلوبة. كما يوضح الدليل كيفية تجديد المنحة السنوية والالتزامات المفروضة على المستفيدين.",
      sector: "التعليم العالي",
      region: "وطني",
      pdf_url: "https://example.com/scholarships-2024.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "المنح الدراسية الجامعية 2024-2025",
        description: "دليل شامل حول المنح الدراسية الجامعية للسنة 2024-2025"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
        alt_text: "المنح الدراسية الجامعية 2024-2025"
      }
    }
  ];

  // Sample Exam Calendars
  const examCalendars = [
    {
      title_ar: "امتحان الباكالوريا في مادة الرياضيات 2025",
      slug_ar: "امتحان-الباكالوريا-في-مادة-الرياضيات-2025",
      body_ar: "امتحان الباكالوريا في مادة الرياضيات لمسلك العلوم التجريبية والرياضيات. سيجرى الامتحان يوم 1 يونيو 2025 على الساعة 8 صباحاً. يشمل الامتحان جميع فروض الرياضيات المقررة في البرنامج الرسمي.",
      exam_date: "2025-06-01",
      subject: "الرياضيات",
      school_level: "باكالوريا",
      sector: "التعليم الثانوي",
      region: "جميع الجهات",
      pdf_url: "https://example.com/bac-maths-2025.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "امتحان الباكالوريا في مادة الرياضيات 2025",
        description: "امتحان الباكالوريا في مادة الرياضيات لمسلك العلوم التجريبية والرياضيات"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop",
        alt_text: "امتحان الباكالوريا في مادة الرياضيات 2025"
      }
    },
    {
      title_ar: "امتحان السنة الثالثة إعدادي في مادة العلوم 2025",
      slug_ar: "امتحان-السنة-الثالثة-إعدادي-في-مادة-العلوم-2025",
      body_ar: "امتحان السنة الثالثة إعدادي في مادة العلوم. سيجرى الامتحان يوم 10 مايو 2025 على الساعة 10 صباحاً. يشمل الامتحان جميع دروس العلوم (الفيزياء والكيمياء وعلوم الحياة والأرض).",
      exam_date: "2025-05-10",
      subject: "العلوم",
      school_level: "إعدادي",
      sector: "التعليم الإعدادي",
      region: "جميع الجهات",
      pdf_url: "https://example.com/3rd-year-science-exam.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "امتحان السنة الثالثة إعدادي في مادة العلوم 2025",
        description: "امتحان السنة الثالثة إعدادي في مادة العلوم"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
        alt_text: "امتحان السنة الثالثة إعدادي في مادة العلوم 2025"
      }
    },
    {
      title_ar: "امتحان الجهوية في مادة الفرنسية 2025",
      slug_ar: "امتحان-الجهوية-في-مادة-الفرنسية-2025",
      body_ar: "امتحان الجهوية في مادة الفرنسية للسنة الأولى باكالوريا. سيجرى الامتحان يوم 15 أبريل 2025 على الساعة 9 صباحاً. يشمل الامتحان جميع أجزاء الامتحان الجهوي في اللغة الفرنسية.",
      exam_date: "2025-04-15",
      subject: "الفرنسية",
      school_level: "باكالوريا",
      sector: "التعليم الثانوي",
      region: "جميع الجهات",
      pdf_url: "https://example.com/regional-french-exam.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "امتحان الجهوية في مادة الفرنسية 2025",
        description: "امتحان الجهوية في مادة الفرنسية للسنة الأولى باكالوريا"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop",
        alt_text: "امتحان الجهوية في مادة الفرنسية 2025"
      }
    },
    {
      title_ar: "امتحان السنة السادسة ابتدائي في مادة العربية 2025",
      slug_ar: "امتحان-السنة-السادسة-ابتدائي-في-مادة-العربية-2025",
      body_ar: "امتحان السنة السادسة ابتدائي في مادة اللغة العربية. سيجرى الامتحان يوم 5 مايو 2025 على الساعة 8 صباحاً. يشمل الامتحان جميع فروع اللغة العربية (قراءة، كتابة، تعبير، قواعد).",
      exam_date: "2025-05-05",
      subject: "العربية",
      school_level: "ابتدائي",
      sector: "التعليم الابتدائي",
      region: "جميع الجهات",
      pdf_url: "https://example.com/6th-grade-arabic-exam.pdf",
      featured: false,
      published: true,
      seoMeta: {
        title: "امتحان السنة السادسة ابتدائي في مادة العربية 2025",
        description: "امتحان السنة السادسة ابتدائي في مادة اللغة العربية"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
        alt_text: "امتحان السنة السادسة ابتدائي في مادة العربية 2025"
      }
    },
    {
      title_ar: "امتحان الباكالوريا في مادة الفيزياء 2025",
      slug_ar: "امتحان-الباكالوريا-في-مادة-الفيزياء-2025",
      body_ar: "امتحان الباكالوريا في مادة الفيزياء لمسلك العلوم التجريبية. سيجرى الامتحان يوم 3 يونيو 2025 على الساعة 8 صباحاً. يشمل الامتحان جميع دروس الفيزياء المقررة في البرنامج الرسمي.",
      exam_date: "2025-06-03",
      subject: "الفيزياء",
      school_level: "باكالوريا",
      sector: "التعليم الثانوي",
      region: "جميع الجهات",
      pdf_url: "https://example.com/bac-physics-2025.pdf",
      featured: true,
      published: true,
      seoMeta: {
        title: "امتحان الباكالوريا في مادة الفيزياء 2025",
        description: "امتحان الباكالوريا في مادة الفيزياء لمسلك العلوم التجريبية"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop",
        alt_text: "امتحان الباكالوريا في مادة الفيزياء 2025"
      }
    }
  ];

  // Create Job Competitions
  for (const job of jobCompetitions) {
    await prisma.jobCompetition.create({
      data: {
        title_ar: job.title_ar,
        slug_ar: job.slug_ar,
        body_ar: job.body_ar,
        sector: job.sector,
        region: job.region,
        closing_date: job.closing_date ? new Date(job.closing_date) : null,
        pdf_url: job.pdf_url,
        featured: job.featured,
        published: job.published,
        seoMeta: {
          create: {
            title: job.seoMeta.title,
            description: job.seoMeta.description
          }
        },
        heroImage: {
          create: {
            url: job.heroImage.url,
            alt_text: job.heroImage.alt_text
          }
        }
      }
    });
  }

  // Create School Guidance
  for (const guidance of schoolGuidance) {
    await prisma.schoolGuidance.create({
      data: {
        title_ar: guidance.title_ar,
        slug_ar: guidance.slug_ar,
        body_ar: guidance.body_ar,
        sector: guidance.sector,
        region: guidance.region,
        pdf_url: guidance.pdf_url,
        featured: guidance.featured,
        published: guidance.published,
        seoMeta: {
          create: {
            title: guidance.seoMeta.title,
            description: guidance.seoMeta.description
          }
        },
        heroImage: {
          create: {
            url: guidance.heroImage.url,
            alt_text: guidance.heroImage.alt_text
          }
        }
      }
    });
  }

  // Create Exam Calendars
  for (const exam of examCalendars) {
    await prisma.examCalendar.create({
      data: {
        title_ar: exam.title_ar,
        slug_ar: exam.slug_ar,
        body_ar: exam.body_ar,
        exam_date: new Date(exam.exam_date ?? Date.now()),
        subject: exam.subject,
        school_level: exam.school_level,
        sector: exam.sector,
        region: exam.region,
        pdf_url: exam.pdf_url,
        featured: exam.featured,
        published: exam.published,
        seoMeta: {
          create: {
            title: exam.seoMeta.title,
            description: exam.seoMeta.description
          }
        },
        heroImage: {
          create: {
            url: exam.heroImage.url,
            alt_text: exam.heroImage.alt_text
          }
        }
      }
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${jobCompetitions.length} job competitions`);
  console.log(`📚 Created ${schoolGuidance.length} school guidance items`);
  console.log(`📅 Created ${examCalendars.length} exam calendars`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });