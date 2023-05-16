const { TranslationServiceClient } = require('@google-cloud/translate');
const translationClient = new TranslationServiceClient();
const en = require('./en.json')
const obj2 = require('./en copy.json')
const projectId = 'kitesuite';
const location = 'global';
const text = 'Hello, world!';
const fs = require('fs')
const translateObject = async (lang) => {
    try {
        let ens = JSON.parse(JSON.stringify(en))
        const val = objectValueToText(ens)

        let arrayTranslated = []
        let finalArray = []
        const arrayOfArray = (array) => {
            if (array.length > 1024) {
                arrayOfArray(array.slice(0, ((array.length) / 2)));
                arrayOfArray(array.slice((array.length) / 2, array.length))
            }
            else {
                finalArray.push(array)
            }
        }
        if (val.length > 1024) {
            arrayOfArray(val)
            for (let fin of finalArray) {
                let result = await TranslateArray(fin, lang);
                arrayTranslated = [...arrayTranslated, ...result]
            }
        }
        // console.log(arrayTranslated.length)
        // console.log(finalArray.length)
        const obj = updateObject(ens, arrayTranslated)
        createJSONFile(obj, lang)
        console.log(lang, arrayTranslated.length)
    } catch (error) {
        console.log(error)
    }
}




const TranslateArray = async (val, lang) => {
    let array = []
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: val,
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: 'en',
        targetLanguageCode: lang,
    };

    // Run request
    const [response] = await translationClient.translateText(request);
    for (const translation of response.translations) {
        array.push(translation.translatedText)
    }
    return array
}

const objectValueToText = (obj, label) => {
    let array = []
    let findObjectByLabel = function (obj) {
        // if(obj.label === label) { return obj; }
        for (var i in obj) {
            if (typeof obj[i] == 'object') {
                findObjectByLabel(obj[i]);
            }
            else if (typeof obj[i] == 'string')
                array.push(obj[i]);
        }
        return null;
    };
    findObjectByLabel(obj);
    console.log(array.length)
    return array
}

const createJSONFile = (obj, fileName) => {
    const jsonString = JSON.stringify(obj);
    fs.writeFileSync(`./translated/${fileName}.json`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

const updateObject = (obj, array) => {
    let index = 0
    let findObjectByLabel = function (obj) {
        // if(obj.label === label) { return obj; }
        for (var i in obj) {
            if (typeof obj[i] == 'object') {
                obj[i] = findObjectByLabel(obj[i])
            }
            else if (typeof obj[i] == 'string') {
                obj[i] = array[index]
                index++
            }
        }
        return obj;
    };
    obj = findObjectByLabel(obj);
    return obj
}


translateObject('fr')
translateObject('es')
translateObject('ar')
translateObject('ru')
translateObject('zh')
translateObject('ja')
translateObject('hi')
