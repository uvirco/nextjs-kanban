const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create default admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create additional test users
  const testUsers = [
    {
      email: "pierre@uvirco.com",
      name: "Pierre",
      password: "pierre",
      role: "MANAGER" as const,
    },
    {
      email: "jaco@uvirco.com",
      name: "Jaco",
      password: "jaco12",
      role: "MANAGER" as const,
    },
    {
      email: "michael@uvirco.com",
      name: "Michale",
      password: "michael",
      role: "MEMBER" as const,
    },
    {
      email: "ters@uvirco.com",
      name: "Ters",
      password: "ters12",
      role: "MEMBER" as const,
    },
    {
      email: "ockert@uvirco.com",
      name: "Ockert",
      password: "ockert",
      role: "MEMBER" as const,
    },
    {
      email: "mathew@uvirco.com",
      name: "Mathew",
      password: "mathew",
      role: "MEMBER" as const,
    },
    {
      email: "leons@uvirco.com",
      name: "LeonS",
      password: "leons12",
      role: "MANAGER" as const,
    },
    {
      email: "leon@uvirco.com",
      name: "Leon",
      password: "leons12",
      role: "MEMBER" as const,
    },
    {
      email: "ian@uvirco.com",
      name: "Ian",
      password: "ian123",
      role: "MEMBER" as const,
    },
    {
      email: "marcel@uvirco.com",
      name: "Marcel",
      password: "marcel",
      role: "MEMBER" as const,
    },
    {
      email: "tshepho@uvirco.com",
      name: "Tshepho",
      password: "tshepho",
      role: "MEMBER" as const,
    },
    {
      email: "nkele@uvirco.com",
      name: "Nkele",
      password: "nkele12",
      role: "MEMBER" as const,
    },
    {
      email: "madeleine@uvirco.com",
      name: "Madeleine",
      password: "madeleine",
      role: "MEMBER" as const,
    },
    {
      email: "tiffany@uvirco.com",
      name: "Tiffany",
      password: "tiffany",
      role: "MEMBER" as const,
    },
    {
      email: "rika@uvirco.com",
      name: "Rika",
      password: "rika12",
      role: "MEMBER" as const,
    },
    {
      email: "ans@uvirco.com",
      name: "Ans",
      password: "ans123",
      role: "MEMBER" as const,
    },
    {
      email: "kimon@uvirco.com",
      name: "Kimon",
      password: "kimon12",
      role: "MEMBER" as const,
    },
  ];

  const createdUsers = [];
  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
      },
    });
    createdUsers.push(user);
    console.log(`✅ ${userData.role} user created:`, user.email);
  }

  // Create sample board
  const board = await prisma.board.upsert({
    where: { id: "sample-board-1" },
    update: {},
    create: {
      id: "sample-board-1",
      title: "Sample Project Board",
      backgroundUrl: null, // No background image to avoid 404 errors
    },
  });
  console.log("✅ Sample board created:", board.title);

  // Add admin as board member
  await prisma.boardMember.upsert({
    where: {
      userId_boardId: {
        userId: admin.id,
        boardId: board.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      boardId: board.id,
      role: "owner",
    },
  });

  // Add all created users as board members
  for (const user of createdUsers) {
    await prisma.boardMember.upsert({
      where: {
        userId_boardId: {
          userId: user.id,
          boardId: board.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        boardId: board.id,
        role: user.role === "MANAGER" ? "owner" : "member",
      },
    });
    console.log(`✅ Added ${user.name} as board member`);
  }

  // Create default columns
  const columns = [
    { title: "To Do", order: 0 },
    { title: "In Progress", order: 1 },
    { title: "Review", order: 2 },
    { title: "Done", order: 3 },
  ];

  for (const columnData of columns) {
    const existingColumn = await prisma.column.findFirst({
      where: {
        boardId: board.id,
        title: columnData.title,
      },
    });

    if (!existingColumn) {
      const column = await prisma.column.create({
        data: {
          title: columnData.title,
          boardId: board.id,
          order: columnData.order,
        },
      });
      console.log("✅ Column created:", column.title);
    } else {
      console.log("✅ Column already exists:", existingColumn.title);
    }
  }

  // Create default labels
  const labels = [
    { title: "Bug", color: "red" },
    { title: "Feature", color: "blue" },
    { title: "Enhancement", color: "green" },
    { title: "Documentation", color: "yellow" },
    { title: "High Priority", color: "orange" },
  ];

  for (const labelData of labels) {
    const existingLabel = await prisma.label.findFirst({
      where: {
        boardId: board.id,
        title: labelData.title,
      },
    });

    if (!existingLabel) {
      const label = await prisma.label.create({
        data: {
          title: labelData.title,
          color: labelData.color,
          userId: admin.id,
          boardId: board.id,
          isDefault: true,
        },
      });
      console.log("✅ Label created:", label.title);
    } else {
      console.log("✅ Label already exists:", existingLabel.title);
    }
  }

  // Create sample tasks
  const todoColumn = await prisma.column.findFirst({
    where: { boardId: board.id, title: "To Do" },
  });

  if (todoColumn) {
    const sampleTasks = [
      {
        title: "Welcome to TaskManager!",
        description:
          "This is a sample task to help you get started. Feel free to edit or delete it.",
        order: 0,
      },
      {
        title: "Create your first board",
        description:
          "Boards help you organize your projects. Try creating a new board for your next project.",
        order: 1,
      },
      {
        title: "Invite team members",
        description:
          "Collaborate with your team by inviting them to boards and assigning tasks.",
        order: 2,
      },
    ];

    for (const taskData of sampleTasks) {
      const existingTask = await prisma.task.findFirst({
        where: {
          columnId: todoColumn.id,
          title: taskData.title,
        },
      });

      if (!existingTask) {
        const task = await prisma.task.create({
          data: {
            title: taskData.title,
            description: taskData.description,
            columnId: todoColumn.id,
            order: taskData.order,
            createdByUserId: admin.id,
          },
        });
        console.log("✅ Sample task created:", task.title);
      } else {
        console.log("✅ Sample task already exists:", existingTask.title);
      }
    }
  }

  // Create board settings
  await prisma.boardSettings.upsert({
    where: { boardId: board.id },
    update: {},
    create: {
      boardId: board.id,
      enablePriority: true,
      enableBusinessValue: false,
      enableEstimatedEffort: false,
      enableDependencies: false,
      enableBudgetEstimate: false,
      enableRiskLevel: false,
      enableStrategicAlignment: false,
      enableRoiEstimate: false,
      enableStageGate: false,
      enableTimeSpent: false,
      enableStoryPoints: false,
      enableWatchers: false,
      enableAttachments: false,
      enableSubtasks: false,
      defaultPriority: "MEDIUM",
      defaultRiskLevel: "LOW",
    },
  });
  console.log("✅ Board settings created");

  console.log("🎉 Database seeding completed successfully!");
  console.log("");
  console.log("📋 Default Login Credentials:");
  console.log("Email: admin@company.com");
  console.log("Password: admin123");
  console.log("");
  console.log("🚀 You can now start using TaskManager!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
