import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from "bullmq";

const queue = new Queue("file-upload-queue");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
})

const app = express();
app.use(cors());



const upload = multer({ storage: storage })


app.get('/', (req, res)=>{
    console.log("All good!");
    return res.json("All good");
})

app.post('/upload/pdf', upload.single('pdf'), async (req, res)=>{
    await queue.add("file-ready",JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path
    }));
    return res.json({message: "File uploaded"});
})

app.listen(8001, ()=>{
    console.log('server started at port 8000');
})