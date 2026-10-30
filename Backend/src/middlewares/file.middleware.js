const multer = require("multer")

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter(req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            const err = new Error("Only PDF resumes are supported.")
            err.status = 400
            return cb(err)
        }

        cb(null, true)
    },
})

module.exports = upload
