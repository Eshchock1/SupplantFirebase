import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from "express"
import * as cors from "cors"
import * as cookieParser from "cookie-parser"
import * as Auth from "./auth/auth"
// import * as Clarifai from "clarifai"
const app = express();

admin.initializeApp(functions.config().firebase);

app.use(cors({origin : true}));
app.use(cookieParser());

app.use(Auth.authCheck);

export const newUserSignup = functions.auth.user().onCreate(Auth.onUserCreate);
export const userDelete = functions.auth.user().onDelete(Auth.onUserDelete);

app.get('/hello', (req, res) => {
res.send(`Hello ${res.locals.user.email}`);
});

//authentication key: e4d847d4fdef446594c5b84aa20c1a79
// Predict the contents of an image by passing in a URL.
// app.get("/ree", (req, res) => {
//   const cApp = new Clarifai.App({apiKey: '4eaa8ee301d04821a00f168bf42ab9dd'});
//   console.log(cApp.models.predict);
//   // console.log(Object.entries(cApp))
//   cApp.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/food.jpg')
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

