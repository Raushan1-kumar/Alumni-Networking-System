const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Job = require("../../models/Job");
const User = require("../../models/User");

dotenv.config();

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Pick some approved alumni to be job posters
    const alumni = await User.find({ role: "alumni", isApproved: true }).limit(5);

    if (alumni.length === 0) {
      console.log("No alumni found. Run seedUsers.js first.");
      process.exit(1);
    }

    await Job.deleteMany();
    console.log("Existing jobs cleared");

    const jobs = [
      {
        postedBy: alumni[0]._id,
        title: "React Developer",
        company: "Infosys",
        location: "Bangalore",
        jobType: "Full-time",
        description:
          "We are looking for a skilled React developer to join our frontend team. You will work on building scalable web applications for enterprise clients.",
        requirements:
          "2+ years React experience, knowledge of Redux, REST APIs, and Git.",
        salary: "8-12 LPA",
        applyLink: "careers.infosys.com",
        lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
      },
      {
        postedBy: alumni[1]._id,
        title: "Data Science Intern",
        company: "TCS",
        location: "Mumbai",
        jobType: "Internship",
        description:
          "6-month internship in our AI/ML division. Work on real datasets and build predictive models alongside experienced data scientists.",
        requirements:
          "Python, pandas, scikit-learn basics. Final year or recent graduates preferred.",
        salary: "15,000/month stipend",
        applyLink: "careers.tcs.com",
        lastDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        postedBy: alumni[2]._id,
        title: "Mechanical Design Engineer",
        company: "Tata Motors",
        location: "Pune",
        jobType: "Full-time",
        description:
          "Design and validate automotive components using CAD tools. Collaborate with manufacturing teams for production-ready designs.",
        requirements:
          "B.Tech Mechanical, proficiency in CATIA or SolidWorks, 1-3 years experience.",
        salary: "6-9 LPA",
        applyLink: "careers.tatamotors.com",
        lastDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        postedBy: alumni[3]._id,
        title: "Backend Engineer - Node.js",
        company: "Razorpay",
        location: "Bangalore",
        jobType: "Full-time",
        description:
          "Build and maintain scalable APIs for our payment infrastructure. Work with high-throughput systems processing millions of transactions.",
        requirements:
          "3+ years Node.js, experience with MongoDB/PostgreSQL, good understanding of system design.",
        salary: "15-22 LPA",
        applyLink: "razorpay.com/jobs",
        lastDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        postedBy: alumni[4]._id,
        title: "Cloud Support Engineer",
        company: "Amazon Web Services",
        location: "Hyderabad",
        jobType: "Full-time",
        description:
          "Provide technical support to AWS customers. Troubleshoot cloud infrastructure issues and help customers optimize their AWS usage.",
        requirements:
          "Knowledge of AWS services, Linux basics, good communication skills.",
        salary: "10-14 LPA",
        applyLink: "amazon.jobs",
        lastDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        postedBy: alumni[0]._id,
        title: "Remote Frontend Developer",
        company: "Startup XYZ",
        location: "Remote",
        jobType: "Remote",
        description:
          "Join a fast-growing startup building a SaaS product. Flexible hours, great learning opportunities.",
        requirements: "Vue.js or React, 1+ year experience, self-motivated.",
        salary: "5-8 LPA",
        applyLink: "startupxyz.com/careers",
        lastDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        postedBy: alumni[1]._id,
        title: "Structural Engineer",
        company: "L&T Construction",
        location: "Chennai",
        jobType: "Full-time",
        description:
          "Design structural components for large infrastructure projects. Work with multi-disciplinary teams on government and private contracts.",
        requirements: "B.Tech Civil, AutoCAD/STAAD Pro, 2+ years experience.",
        salary: "7-11 LPA",
        applyLink: "careers.larsentoubro.com",
        lastDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        isActive: false, // closed listing
      },
    ];

    await Job.insertMany(jobs);
    console.log(`${jobs.length} jobs seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedJobs();