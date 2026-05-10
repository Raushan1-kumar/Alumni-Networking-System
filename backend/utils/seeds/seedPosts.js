const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("../../models/Post");
const User = require("../../models/User");

dotenv.config();

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const alumni = await User.find({ role: "alumni", isApproved: true });

    if (alumni.length === 0) {
      console.log("No alumni found. Run seedUsers.js first.");
      process.exit(1);
    }

    await Post.deleteMany();
    console.log("Existing posts cleared");

    const posts = [
      {
        author: alumni[0]._id,
        content:
          "Just completed my first year at Infosys! The journey from GEC to a top IT firm has been incredible. To all juniors — focus on DSA and build projects. That's what gets you hired. Happy to help anyone with interview prep. 🙌",
        tags: ["career", "advice", "placement"],
        likes: [alumni[1]._id, alumni[2]._id, alumni[3]._id],
        comments: [
          {
            user: alumni[1]._id,
            text: "Congratulations Rahul! This is inspiring.",
          },
          {
            user: alumni[2]._id,
            text: "Would love to connect for some tips!",
          },
        ],
      },
      {
        author: alumni[1]._id,
        content:
          "Excited to share that I just published my first IEEE paper on IoT-based smart irrigation systems. It was a long journey but totally worth it. Special thanks to our professors at GEC who gave me the research foundation. 🎉",
        tags: ["research", "achievement", "IoT"],
        likes: [alumni[0]._id, alumni[3]._id, alumni[4]._id],
        comments: [
          {
            user: alumni[3]._id,
            text: "Amazing achievement Priya! Can you share the paper link?",
          },
        ],
      },
      {
        author: alumni[2]._id,
        content:
          "Looking for mechanical engineers with CAD experience for a project at Tata Motors. If any GEC alumni or final year students are interested, feel free to DM me. Internship and full-time options available.",
        tags: ["hiring", "mechanical", "opportunity"],
        likes: [alumni[0]._id, alumni[4]._id],
        comments: [],
      },
      {
        author: alumni[3]._id,
        content:
          "Quick tip for juniors appearing for fintech interviews: know your system design basics well. Questions around payment gateways, rate limiting, and idempotency come up often. Happy to do a mock interview session if anyone's interested!",
        tags: ["advice", "interview", "fintech"],
        likes: [alumni[0]._id, alumni[1]._id, alumni[4]._id],
        comments: [
          {
            user: alumni[0]._id,
            text: "This is gold. Thank you Rohit!",
          },
          {
            user: alumni[4]._id,
            text: "Would love a mock interview session!",
          },
        ],
      },
      {
        author: alumni[4]._id,
        content:
          "Just got AWS Solutions Architect certified! If anyone from GEC is planning to get cloud certified, feel free to reach out. I have some notes and practice resources I can share.",
        tags: ["achievement", "cloud", "AWS", "certification"],
        likes: [alumni[0]._id, alumni[1]._id, alumni[2]._id, alumni[3]._id],
        comments: [
          {
            user: alumni[2]._id,
            text: "Congratulations! Please share the resources.",
          },
        ],
      },
      {
        author: alumni[5]._id,
        content:
          "8 years in the construction industry and I still think GEC's civil engineering program gave me the best foundation. The labs and site visits during third year were truly eye-opening. Missing those days!",
        tags: ["nostalgia", "civil", "GEC"],
        likes: [alumni[1]._id, alumni[3]._id],
        comments: [
          {
            user: alumni[1]._id,
            text: "Same feeling here! Those days were the best.",
          },
        ],
      },
      {
        author: alumni[6]._id,
        content:
          "Renewable energy is the future and I'm so glad I get to work on it every day at NTPC. If any electrical engineering graduates are looking for PSU opportunities, NTPC recruitment opens every January. Prepare for GATE!",
        tags: ["PSU", "GATE", "electrical", "advice"],
        likes: [alumni[0]._id, alumni[2]._id],
        comments: [],
      },
    ];

    await Post.insertMany(posts);
    console.log(`${posts.length} posts seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedPosts();