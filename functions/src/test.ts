const Clarifai = require("clarifai")

const cApp = new Clarifai.App({apiKey: 'f6c5175813ec49ba9b5896593b1488d5'});
    console.log(cApp.models.predict);
    // console.log(Object.entries(cApp))
    cApp.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/food.jpg')
  .then((res: any) => {
    console.log((res.outputs[0].data.concepts))


  }).catch((err : any)=>console.log(err));