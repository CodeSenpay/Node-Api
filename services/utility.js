import multer from "multer";
import sharp from "sharp";
import pool from "../config/db.conf.js";


// Use memory storage for security and efficient processing
const storage = multer.memoryStorage();

// Validate file types and size
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Accept only image MIME types
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed"));
        }
    }
});

/**
 * Returns the current school year in the format "YYYY-YYYY+1"
 */
export function generateSchoolYear() {
    const now = new Date();
    const startYear = now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
}

/**
 * Returns the current semester as "1st Semester", "2nd Semester", or "Summer"
 */
export function generateSemester() {
    const month = new Date().getMonth() + 1;
    if (month >= 8) return "1st Semester";
    if (month <= 5) return "2nd Semester";
    return "Summer";
}

/**
 * Express handler for uploading & compressing a student profile image.
 * Uses memory uploads and sharp directly—no disk I/O.
 */

export const handleUploadStudentProfile = () => [
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }
            const { student_id } = req.body;
            if (!student_id) {
                return res.status(400).json({ success: false, message: "Missing student_id" });
            }

            // Compress and convert to base64
            const compressed = await sharp(req.file.buffer)
                .resize({ width: 800 })
                .jpeg({ quality: 70 })
                .toBuffer();

            const base64 = compressed.toString("base64");

            // Prepare JSON for stored procedure
            const jsondata = JSON.stringify({
                student_id,
                student_profile: base64
            });

            // Call the stored procedure
            const [rows] = await pool.query("CALL upload_student_profile(?)", [jsondata]);
            // The result is in rows[0][0].Result (as JSON string)
            let result;
            try {
                result = JSON.parse(rows[0][0].Result);
            } catch {
                result = rows[0][0].Result;
            }

            res.json({
                success: true,
                message: "Profile uploaded successfully",
                ...result,
                base64 // Optionally return the base64 for client preview
            });
        } catch (err) {
            console.error("Upload/DB error:", err);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
];



