import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from "express"
import * as cors from "cors"
import * as cookieParser from "cookie-parser"
import * as Auth from "./auth/auth"
import {Storage} from '@google-cloud/storage'
const gcs = new Storage();
import {tmpdir} from 'os'
import * as path from 'path'
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
// import * as fileUpload from 'express-fileupload';
// import * as Multer from 'multer';
import * as Busboy from 'busboy';
admin.initializeApp(functions.config().firebase);
const { join, dirname} = path;
admin.storage().bucket();

const UUID = require('uuid-v4');

export const generateThumbs = functions.storage.object().onFinalize( async (object, context) => {
  const bucket = gcs.bucket(object.bucket);
  const filePath = object.name as string;
  const fileName : string = (filePath?.split('/').pop()) as string;
  const bucketDir = dirname(filePath)
  const workingDir = join(tmpdir(), 'thumbs');
  const tmpFilePath = join(workingDir, 'source.png');
  if(fileName.includes('thumb@') || !object.contentType?.includes('image')) {
    return false
  }

  await fs.ensureDir(workingDir);

  await bucket.file(filePath).download({
    destination : tmpFilePath
  });

  const size = 256; 
  const fileNameUuid = UUID();
  const fileExtension = fileName.split('.').pop() as string;

  const thumbName = `thumb@${size}_${fileNameUuid}.${fileExtension}`;
  const thumbPath = join(workingDir, thumbName);
  await sharp(tmpFilePath)
    .resize(size, size)
    .toFile(thumbPath);

  // const uuid = UUID();
  const newFileName = join(bucketDir, thumbName);
  await bucket.upload(thumbPath, {
    destination: newFileName,
    metadata: { }
  });

  const userId = context.auth?.uid || "ADMIN";
  await bucket.file(fileName).delete();
  await fs.remove(workingDir);  
  await bucket.file(newFileName).makePublic()
  const itemData = {
    uploaded : Date.now(),
    userId, 
    imageUrl : `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(newFileName)}?alt=media`
  }
  await admin.firestore().collection('scans').doc(newFileName).set(itemData)
  return;
})
// import * as Clarifai from "clarifai"
const app = express(); 


app.use(cors({origin : true}));
app.use(cookieParser());

// app.use(fileUpload({
//   limits: { fileSize: 10 * 1024 * 1024 },
//   useTempFiles : true,
//   tempFileDir : '/tmp/'
// }))
app.use(Auth.authCheck);

export const newUserSignup = functions.auth.user().onCreate(Auth.onUserCreate);
export const userDelete = functions.auth.user().onDelete(Auth.onUserDelete);

const Clarifai = require("clarifai")

const cApp = new Clarifai.App({apiKey: 'd0f5995c479e472f8c71897974994854'});

// export const asdf = functions.storage.object().onFinalize((object, context) => {

//     object.
//     context.auth?.uid;
// });

app.get('/hello', (req, res) => {
res.send(`Hello ${res.locals.user.email}`);
});

app.post('/foodUpload', (req, res) => {
  const busboy = new Busboy({ headers : req.headers});
  const uploads : {[index:string] : any}= {};
  let isFile = false;
  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    console.log(`File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
            // Note that os.tmpdir() is an in-memory file system, so should only 
            // be used for files small enough to fit in memory.
            const workingDir = join(tmpdir(), 'thumbs');
            const filepath = path.join(workingDir, filename);
            await fs.ensureDir(workingDir)
            await fs.ensureFile(filepath);

            uploads[fieldname] = { filepath, filename }
            console.log(`Saving '${fieldname}' to ${filepath}`);
            file.pipe(fs.createWriteStream(filepath));           
      console.log(1);
      isFile = true;
      return;
  })
  // req.busboy
    busboy.on('finish', async () => {
      console.log(2);
      if(!isFile) {
        res.send("NO FILE");
      }
      for (const name in uploads) {
          const upload = uploads[name];
          const {filepath, filename} = upload;
          console.log(3);

          const size = 256;
            const fileExtension = filename.split('.').pop() as string;
            const fileNameUuid = UUID();
            const thumbName = `thumb@${size}_${fileNameUuid}.${fileExtension}`;
            console.log(4);

            const thumbPath = join(tmpdir(), 'thumbs', thumbName);
            await(new Promise(resolve => setTimeout(() => resolve("some value"), 500)))
          
            await sharp(filepath)
              .resize(256, 256)
              .toFile(thumbPath);
            console.log(5);

            const bucket = admin.storage().bucket();

            console.log(2);
            await bucket.upload(thumbPath, {
              destination: thumbName,
              metadata: { }
            });
            console.log(6);
          
            const userId = res.locals.user?.uid || "ADMIN";
            // await fs.remove(os.tmpdir());
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(thumbName)}?alt=media`;
            await bucket.file(thumbName).makePublic()
            const itemData = {
              uploaded : Date.now(),
              userId, 
              imageUrl
            }
            console.log(7);
            await admin.firestore().collection('users').doc(userId).collection('scans').doc(thumbName).set(itemData);
            // const otherImageUrl = "https://firebasestorage.googleapis.com/v0/b/supplant-44e15.appspot.com/o/thumb%40256_cef23547-50fb-4124-8e51-8f2e82a8db8f.jpg?alt=media"
          console.log(cApp.models.predict);
          console.log(8);
          // console.log(Object.entries(cApp))
         await cApp.models.predict(Clarifai.GENERAL_MODEL, imageUrl)
          .then((newRes: any) => {
              console.log((newRes.outputs[0].data.concepts));
            res.json(newRes.outputs[0].data.concepts);
            console.log(9);
  }).catch((err : any)=>console.log(err));
  

  
  await fs.remove(join(tmpdir(), 'thumbs'));

      }
  });
  busboy.end(req.body);
  // res.send('reee');
})


//authentication key: e4d847d4fdef446594c5b84aa20c1a79
// Predict the contents of an image by passing in a URL.
// app.get("/ree", (req, res) => {
//   const cApp = new Clarifai.App({apiKey: '4eaa8ee301d04821a00f168bf42ab9dd'});
//   console.log(cApp.models.predict);
//   // console.log(Object.entries(cApp))
//   cApp.models.predict(Claritfai.GENERAL_MODEL, 'https://samples.clarifai.com/food.jpg')
// .then((response: any) => {
//   console.log((response.outputs[0].data.concepts))
//   res.json(response.outputs[0].data.concepts)
// }).catch((err : any)=>console.log(err));
//   res.send("hi")
// })


  
  // This HTTPS endpoint can only be accessed by your Firebase Users.
  // Requests need to be authorized by providing an `Authorization` HTTP header
  // with value `Bearer <Firebase ID Token>`.
export const api = functions.https.onRequest(app);

//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// Instantiate a new Clarifai app by passing in your API key.

