const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Event = require("../../models/Event");
const User = require("../../models/User");

dotenv.config();

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("No admin found. Run seedUsers.js first.");
      process.exit(1);
    }

    await Event.deleteMany();
    console.log("Existing events cleared");

    const events = [
      {
        createdBy: admin._id,
        title: "Annual Alumni Reunion 2025",
        description:
          "Join us for the grand annual reunion of all GEC alumni. Reconnect with batchmates, meet faculty, and celebrate the college's legacy. Includes cultural programs, dinner, and networking sessions.",
        eventType: "Reunion",
        venue: "GEC Main Auditorium, Cuttack",
        eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        lastDateToRegister: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        maxAttendees: 500,
        isActive: true,
      },
      {
        createdBy: admin._id,
        title: "Web Development Workshop",
        description:
          "A hands-on full-day workshop covering modern web development with React and Node.js. Suitable for current students and recent graduates looking to upskill.",
        eventType: "Workshop",
        venue: "CS Department Lab, GEC",
        eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        lastDateToRegister: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        maxAttendees: 60,
        isActive: true,
      },
      {
        createdBy: admin._id,
        title: "Career Guidance Seminar",
        description:
          "Senior alumni from top companies will share career insights, interview tips, and industry trends. Open to all alumni and final year students.",
        eventType: "Seminar",
        venue: "Seminar Hall, Block B, GEC",
        eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        lastDateToRegister: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxAttendees: 200,
        isActive: true,
      },
      {
        createdBy: admin._id,
        title: "Alumni Networking Night - Bangalore Chapter",
        description:
          "An informal evening for GEC alumni based in Bangalore to connect, network, and explore collaboration opportunities. Light refreshments provided.",
        eventType: "Networking",
        venue: "The Lalit Ashok, Bangalore",
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastDateToRegister: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        maxAttendees: 100,
        isActive: true,
      },
      {
        createdBy: admin._id,
        title: "Batch 2018 Mini Reunion",
        description:
          "Exclusive gathering for the 2018 batch alumni. Share memories, updates, and celebrate 7 years since graduation.",
        eventType: "Reunion",
        venue: "Online (Google Meet)",
        eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        lastDateToRegister: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        maxAttendees: null, // unlimited
        isActive: true,
      },
      {
        createdBy: admin._id,
        title: "IoT and Embedded Systems Talk",
        description:
          "A technical talk by senior alumni working in the IoT and embedded systems space. Topics include industry trends, career paths, and live demos.",
        eventType: "Seminar",
        venue: "ECE Seminar Hall, GEC",
        eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // past event
        lastDateToRegister: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        maxAttendees: 150,
        isActive: false,
      },
    ];

    await Event.insertMany(events);
    console.log(`${events.length} events seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedEvents();