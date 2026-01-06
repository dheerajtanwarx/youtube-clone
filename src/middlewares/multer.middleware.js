//agar multer na ho to apn file ko localstorage me ni rkh skte  mtlb express file ke data ko smjhe ga hi ni
import multer from "multer";

//ye code sidha multer repo se liya hai. https://github.com/expressjs/multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/null')
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage, })