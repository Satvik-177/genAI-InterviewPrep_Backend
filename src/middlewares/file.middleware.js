import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024  // 3MB
    },
    fileFilter: (req, file, cb) => {

        if(!file) return cb(null, true)

        if(file.mimetype === "application/pdf"){
            cb(null, true)
        } else {
            cb(new Error("Only PDF files are allowed"), false)
        }
    }
})

export default upload