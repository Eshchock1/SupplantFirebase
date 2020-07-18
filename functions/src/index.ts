import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

export const testAuth= functions.https.onRequest(async(req,res) => {
    const token = req.headers.authorization;
    if(token)
    {
        admin.auth().verifyIdToken(token).then(function(decodedToken)
        {
            res.json({result :`GOTTEM ${decodedToken} + ${token}`});
        }).catch(err => {
            res.json({result :`failed ${err} + ${token}`});
        });
    }    
})


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
