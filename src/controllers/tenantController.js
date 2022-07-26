var path = require('path')
const fs = require('fs')
const fsPromises = fs.promises
const multer = require("multer")
const {
    SUCCESS_200,
    ERR_500,
    ERR_400
} = require("../helpers/constants/statusCodeHTTP")
const titlePage = "Quản lí Logo"

exports.index = async (req, res, next) => {
    try {
        const foundLogo = await fsPromises.readdir('public/dist/img/logo')

        return _render(req, res, "tenant/index", {
            title: titlePage,
            titlePage: titlePage,
            logoPath: foundLogo.length > 0 ? path.normalize(path.join(_rootPath, 'public', 'dist', 'img', 'logo', foundLogo[0])) : '',
            nameFile: foundLogo.length > 0 ? foundLogo[0] : '',
            imageLink: foundLogo.length > 0 ? path.normalize(path.join('dist', 'img', 'logo', foundLogo[0])) : '',
        })
    } catch (error) {
        console.log('Trang logo lỗi', error)
        return next(error)
    }
}

exports.upload = async (req, res, next) => {
    try {
        const foundLogo = await fsPromises.readdir('public/dist/img/logo')
        if (foundLogo.length > 0) {
            let logoPath = path.normalize(path.join(_rootPath, 'public', 'dist', 'img', 'logo', foundLogo[0]))
            await fsPromises.unlink(logoPath)
        }
        upload(req, res, function (err) {

            if (err) {
                'MulterError  Unexpected field'
                // ERROR occurred (here it can be occurred due
                // to uploading image of size greater than
                // 1MB or uploading different file type)
                // res.send(err)
                return res.status(ERR_400.code).json({ message: err })
            }
            return res.status(SUCCESS_200.code).json({ message: "Upload ảnh thàng công" })
        })
    } catch (error) {
        return res.status(ERR_500.code).json({ message: error })
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "public/dist/img/logo")
    },
    filename: function (req, file, cb) {

        // rename lại thành tên mặc định để hiển thị luôn ở giao diện
        cb(null, "default.png")
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/
        var mimetype = filetypes.test(file.mimetype)

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase())

        if (mimetype && extname) {
            return cb(null, true)
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes)
    }

    // mypic is the name of file attribute
}).single("mypic") 