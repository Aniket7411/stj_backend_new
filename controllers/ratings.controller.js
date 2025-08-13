const Rating = require("../models/rating.model"); // Import your Rating model

// POST: Add a review
const addReview = async (req, res) => {
    try {
        const { rating, review, jobId} = req.body;
        const employeeId=req.user.userId

        console.log(rating,review,jobId,employeeId);

        if (!rating || !review || !jobId || !employeeId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = new Rating({
            rating,
            reviews:review,
            jobId,
            employeeId,
        });

        await newReview.save();
        return res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: error.message });
    }
};

// GET: Fetch all reviews by jobId
const getAllReviewsByJobId = async (req, res) => {
    try {
        const { jobId } = req.query;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        const reviews = await Rating.find({ jobId }).populate("employeeId", "name email");

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this job" });
        }

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { addReview, getAllReviewsByJobId };
