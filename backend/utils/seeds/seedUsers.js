const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../../models/User");

dotenv.config();

const users = [
  // ── Admin ──────────────────────────────────────────────────
  {
    name: "Admin User",
    email: "admin@alumni.com",
    password: "admin123",
    role: "admin",
    isApproved: true,
    batchYear: 2015,
    department: "Computer Science",
    phone: "9000000001",
    location: "Bhubaneswar",
    bio: "Platform administrator.",
    currentCompany: "Government Engineering College",
    currentRole: "Administrator",
  },

  // ── Alumni ─────────────────────────────────────────────────
  {
    name: "Rahul Mohanty",
    email: "rahul@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2018,
    department: "Computer Science",
    phone: "9000000002",
    location: "Bangalore",
    bio: "Full stack developer passionate about open source.",
    currentCompany: "Infosys",
    currentRole: "Software Engineer",
    industry: "Information Technology",
    linkedIn: "linkedin.com/in/rahulmohanty",
    interests: ["coding", "open source", "AI"],
  },
  {
    name: "Priya Das",
    email: "priya@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2019,
    department: "Electronics",
    phone: "9000000003",
    location: "Hyderabad",
    bio: "Embedded systems engineer working on IoT projects.",
    currentCompany: "Wipro",
    currentRole: "Embedded Engineer",
    industry: "Electronics",
    linkedIn: "linkedin.com/in/priyadass",
    interests: ["IoT", "robotics", "electronics"],
  },
  {
    name: "Aakash Patel",
    email: "aakash@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2017,
    department: "Mechanical",
    phone: "9000000004",
    location: "Pune",
    bio: "CAD designer and product engineer.",
    currentCompany: "Tata Motors",
    currentRole: "Product Engineer",
    industry: "Automotive",
    linkedIn: "linkedin.com/in/aakashpatel",
    interests: ["CAD", "manufacturing", "automobiles"],
  },
  {
    name: "Sneha Rath",
    email: "sneha@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2020,
    department: "Computer Science",
    phone: "9000000005",
    location: "Mumbai",
    bio: "Data scientist working on predictive models.",
    currentCompany: "TCS",
    currentRole: "Data Scientist",
    industry: "Information Technology",
    linkedIn: "linkedin.com/in/sneharath",
    interests: ["machine learning", "data", "python"],
  },
  {
    name: "Vikram Nair",
    email: "vikram@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2016,
    department: "Civil",
    phone: "9000000006",
    location: "Chennai",
    bio: "Structural engineer with 8 years of experience.",
    currentCompany: "L&T Construction",
    currentRole: "Senior Structural Engineer",
    industry: "Construction",
    linkedIn: "linkedin.com/in/vikramnair",
    interests: ["construction", "sustainability", "infrastructure"],
  },
  {
    name: "Anjali Mishra",
    email: "anjali@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2021,
    department: "Electrical",
    phone: "9000000007",
    location: "Delhi",
    bio: "Power systems engineer at a leading energy firm.",
    currentCompany: "NTPC",
    currentRole: "Junior Engineer",
    industry: "Energy",
    linkedIn: "linkedin.com/in/anjalimishra",
    interests: ["renewable energy", "power systems", "sustainability"],
  },
  {
    name: "Rohit Sharma",
    email: "rohit@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2018,
    department: "Computer Science",
    phone: "9000000008",
    location: "Bangalore",
    bio: "Backend engineer and startup enthusiast.",
    currentCompany: "Razorpay",
    currentRole: "Backend Engineer",
    industry: "Fintech",
    linkedIn: "linkedin.com/in/rohitsharma",
    interests: ["fintech", "startups", "nodejs"],
  },
  {
    name: "Deepa Kulkarni",
    email: "deepa@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2015,
    department: "Electronics",
    phone: "9000000009",
    location: "Kolkata",
    bio: "VLSI design engineer with a focus on chip architecture.",
    currentCompany: "Intel",
    currentRole: "VLSI Engineer",
    industry: "Semiconductors",
    linkedIn: "linkedin.com/in/deepakulkarni",
    interests: ["VLSI", "semiconductors", "chip design"],
  },
  {
    name: "Arjun Reddy",
    email: "arjun@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: true,
    batchYear: 2022,
    department: "Computer Science",
    phone: "9000000010",
    location: "Hyderabad",
    bio: "Fresh grad working in cloud infrastructure.",
    currentCompany: "Amazon Web Services",
    currentRole: "Cloud Support Engineer",
    industry: "Cloud Computing",
    linkedIn: "linkedin.com/in/arjunreddy",
    interests: ["cloud", "AWS", "devops"],
  },

  // ── Pending (not approved yet) ────────────────────────────
  {
    name: "Meena Sahu",
    email: "meena@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: false,
    batchYear: 2023,
    department: "Mechanical",
    phone: "9000000011",
    location: "Rourkela",
  },
  {
    name: "Suresh Babu",
    email: "suresh@alumni.com",
    password: "alumni123",
    role: "alumni",
    isApproved: false,
    batchYear: 2023,
    department: "Civil",
    phone: "9000000012",
    location: "Cuttack",
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await User.deleteMany(); // clear existing users
    console.log("Existing users cleared");

    // Create one by one so the pre-save password hashing hook runs
    for (const userData of users) {
      await User.create(userData);
    }

    console.log(`${users.length} users seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedUsers();