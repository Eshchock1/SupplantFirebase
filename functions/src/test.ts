const Clarifai = require("clarifai")

const cApp = new Clarifai.App({apiKey: '4eaa8ee301d04821a00f168bf42ab9dd'});
    console.log(cApp.models.predict);
    // console.log(Object.entries(cApp))
    cApp.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/food.jpg')
  .then((res: any) => {
    console.log((res.outputs[0].data.concepts))


  }).catch((err : any)=>console.log(err));