const Job = require("../models/Job");

// ─────────────────────────────────────────────────────────────
// POST /api/jobs
// Private — any logged-in alumni can post a job
// ─────────────────────────────────────────────────────────────
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only alumni can post job listings' });
    }

    const {
      title,
      company,
      location,
      jobType,
      description,
      requirements,
      salary,
      applyLink,
      lastDate,
    } = req.body;

    const job = await Job.create({
      postedBy: req.user._id,
      title,
      company,
      location,
      jobType,
      description,
      requirements,
      salary,
      applyLink,
      lastDate,
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/jobs
// Private — get all active job listings
// Supports filter: jobType, location, company
// ─────────────────────────────────────────────────────────────
const getAllJobs = async (req, res) => {
  try {
    const { jobType, location, company, search } = req.query;

    const filter = { isActive: true };

    if (jobType) filter.jobType = jobType;

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (company) {
      filter.company = { $regex: company, $options: "i" };
    }
    // Search across title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("postedBy", "name profilePhoto currentRole") // show poster info
      .sort({ createdAt: -1 }); // newest first

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/jobs/:id
// Private — get single job details
// ─────────────────────────────────────────────────────────────
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email profilePhoto currentRole currentCompany"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/jobs/:id
// Private — only the person who posted can edit it
// ─────────────────────────────────────────────────────────────
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Only poster or admin can edit
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this job" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // return updated document
    );

    res.json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/jobs/:id
// Private — poster or admin can delete
// ─────────────────────────────────────────────────────────────
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/jobs/:id/apply
// Private — alumni applies to a job (recorded in DB)
// ─────────────────────────────────────────────────────────────
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: "This job listing is closed" });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      (a) => a.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied" });
    }

    job.applicants.push({ user: req.user._id });
    await job.save();

    res.json({ message: "Applied successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/jobs/:id/applicants
// Private — only the poster or admin can see who applied
// ─────────────────────────────────────────────────────────────
const getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "applicants.user",
      "name email profilePhoto batchYear department currentRole"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view applicants" });
    }

    res.json(job.applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/jobs/my-posts
// Private — get all jobs posted by the logged-in user
// ─────────────────────────────────────────────────────────────
const getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/jobs/:id/close
// Private — poster or admin can close a listing
// ─────────────────────────────────────────────────────────────
const closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this job" });
    }

    job.isActive = false;
    await job.save();

    res.json({ message: "Job listing closed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getApplicants,
  getMyPostedJobs,
  closeJob,
};