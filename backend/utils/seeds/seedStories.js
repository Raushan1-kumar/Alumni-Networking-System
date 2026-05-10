const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SuccessStory = require("../../models/SuccessStory");
const User = require("../../models/User");

dotenv.config();

const seedStories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const alumni = await User.find({ role: "alumni", isApproved: true });

    if (alumni.length === 0) {
      console.log("No alumni found. Run seedUsers.js first.");
      process.exit(1);
    }

    await SuccessStory.deleteMany();
    console.log("Existing stories cleared");

    const stories = [
      {
        author: alumni[0]._id,
        title: "From a Small Town to Infosys — My Journey",
        story:
          "Growing up in a small town in Odisha, becoming a software engineer at Infosys felt like a distant dream. GEC gave me the platform, the professors gave me the guidance, and my batchmates gave me the competition I needed. I failed my first two campus interviews but didn't give up. On the third attempt I cleared Infosys and it changed my life. To every student struggling — your time will come.",
        achievement: "Placed at Infosys as Software Engineer",
        category: "Career",
        isApproved: true,
      },
      {
        author: alumni[1]._id,
        title: "Published in IEEE at Age 24",
        story:
          "Research always fascinated me but I never thought I'd publish in IEEE so early. It started as a college mini-project on smart irrigation using IoT sensors. My professor encouraged me to extend it into a research paper. After 6 months of work and two rejections, it finally got accepted. The experience taught me that persistence matters more than talent.",
        achievement: "IEEE paper published on IoT-based smart irrigation",
        category: "Research",
        isApproved: true,
      },
      {
        author: alumni[3]._id,
        title: "Building Payment Systems at Razorpay",
        story:
          "When I joined GEC I had no idea what fintech was. By third year I was fascinated by how digital payments work. I spent my final year building a mock payment gateway as my project. That project became my portfolio piece and got me the Razorpay interview. Now I work on systems that process crores of transactions every day. Dream big and build things — not just projects.",
        achievement: "Backend Engineer at Razorpay handling crore-scale transactions",
        category: "Career",
        isApproved: true,
      },
      {
        author: alumni[5]._id,
        title: "Leading Infrastructure Projects at L&T",
        story:
          "Civil engineering was my passion from day one. During GEC I participated in every structural design competition I could find. After graduation I joined L&T as a junior engineer. Eight years later I am leading a team of 20 engineers on a national highway project worth 500 crores. The discipline and attention to detail that GEC instilled in me is what got me here.",
        achievement: "Lead Structural Engineer at L&T on a 500Cr highway project",
        category: "Career",
        isApproved: true,
      },
      {
        author: alumni[4]._id,
        title: "AWS Certified and Loving Cloud",
        story:
          "I barely knew what cloud computing was when I graduated. My first job at AWS was overwhelming. But I kept learning, kept certifying, and now I hold three AWS certifications. I mentor 5 junior engineers on my team. If you're a fresh graduate feeling lost — that feeling is normal. Just keep going.",
        achievement: "AWS Solutions Architect Certified, mentoring a team of 5",
        category: "Career",
        isApproved: true,
      },
      {
        author: alumni[6]._id,
        title: "Working on India's Renewable Energy Future",
        story:
          "I cleared GATE in my first attempt and joined NTPC through their direct recruitment. Today I work on solar and wind integration projects that power thousands of homes. It feels incredibly meaningful to contribute to India's clean energy goals. If any electrical students are reading this — GATE is hard but it opens amazing doors.",
        achievement: "GATE qualified, working at NTPC on renewable energy projects",
        category: "Career",
        isApproved: true,
      },
      {
        author: alumni[2]._id,
        title: "From Campus to Car Industry",
        story:
          "Mechanical engineering was always my calling. I loved every machine drawing lab session at GEC. After placement at Tata Motors I got to work on actual vehicle component design. Last year my team's design was approved for production — seeing something I designed on a real car on the road is a feeling I can't describe.",
        achievement: "Vehicle component design approved for production at Tata Motors",
        category: "Career",
        isApproved: true,
      },
      // Pending approval
      {
        author: alumni[7]._id,
        title: "Starting My Own Tech Startup",
        story:
          "After 3 years at a product company I decided to take the leap and start my own SaaS startup. It has been 8 months and we have 50 paying customers. It's scary but exciting every day.",
        achievement: "Founded a SaaS startup with 50 paying customers",
        category: "Entrepreneurship",
        isApproved: false,
      },
    ];

    await SuccessStory.insertMany(stories);
    console.log(`${stories.length} stories seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedStories();