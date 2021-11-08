"use strict";
// Simple server to receive email with POST

const http             = require('http');
const path             = require('path');
const fs               = require('fs');
const express          = require('express');
const bodyParser       = require('body-parser');
const methodOverride   = require('method-override');
//const logger         = require('morgan');
const axios            = require('axios');
const hibp             = require('hibp'); // https://www.npmjs.com/package/hibp // https://github.com/wKovacs64/hibp
const {google}         = require('googleapis');

// GOOGLE API Translation ///////////////////////////////
// https://console.cloud.google.com/apis/dashboard?authuser=1&project=pw********************8
// https://cloud.google.com/translate/docs/reference/rest/v3beta1/projects/translateText

const projectName = 'projects/pw********************08';
const keyFilename = path.join(__dirname, 'pwned-326008-9f5aebb2e10c.json');
let translate, auth, authClient = null;

const tradDescrFrFile = path.join(__dirname, './tradDescrFr.json'); // Google Trads Cache : {breach.Name: breach.Description, ...} 
let tradDescrFr = JSON.parse(fs.readFileSync(tradDescrFrFile));

const initGoogleTranslation = async function() {
    translate = google.translate('v3');
    auth = new google.auth.GoogleAuth({
        keyFilename: keyFilename,
        scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/cloud-translation']
    });
    authClient = await auth.getClient();
    google.options({auth: authClient});
    console.log(await getFrenchTranslation("Google translation is ok"));
};

const getFrenchTranslation = async function(values /* Recursive : */, keepVals, index, RO, RE) { // values : string or array

    return new Promise((resolve, reject) => {

        if (!keepVals) keepVals = [];
        if (!index) index = 0; // Current POS
        if (RO) resolve = RO; // Keep old promise when recursive
        if (RE) reject = RE;

        if (!index) { // Uniquement au 1er appel
            if (!Array.isArray(values)) values = [values];
            values = values.map(
                val => val.length > 1024 ? val.substring(0, 1024 - 6) + ' (...)' : val // The max length of ONE field is 1024
            );
        }
        
        const maxLength = 10000; // Max length of ALL field is 30k codepoints
        let tradVals = [];
        
        if (values.join('').length < maxLength) {
            tradVals = values;
        }
        else { // Split array content
            for (; index < values.length; index++) {
                if ((tradVals.join('').length + values[index].length) < maxLength) { // How much chars in array ?
                    tradVals.push(values[index]);
                }
                else break;
            }
        }

        translate.projects.translateText({
                parent: projectName,
                requestBody: {
                    "contents": tradVals, // Total content be less than 30k codepoints. The max length of this field is 1024
                    "mimeType": "text/html",
                    "sourceLanguageCode": "en-US",
                    "targetLanguageCode": "fr-FR"
                }
            })
            .then(res => {
                if (res.data && res.data.translations && res.data.translations[0]) {
                    res.data.translations = res.data.translations.map(translation => translation.translatedText); // transform obj key value as a string
                    keepVals = keepVals.concat(res.data.translations); // Merge trads
                    if (index > 0 && index < values.length) {
                        return getFrenchTranslation(values, keepVals, index, resolve, reject); // Keep going...
                    }
                    else {
                        return resolve(keepVals.length === 1 ? keepVals[0] : keepVals); // OUTPUT : string or array
                    }
                }
                else {
                    console.log('Google translation error? (1)');
                    return reject('Google translation error? (1) '+JSON.stringify(res.data));
                }
            })
            .catch(error => {
                console.log('Google translation error? (2)', error);
                return reject('Google translation network error? (2)'+JSON.stringify(error));
            });
    });
};

// Custom translations ///////////////////////////////

let tradClassesFr = JSON.parse(fs.readFileSync(path.join(__dirname, 'tradClassesFr.json')));
// tradClassesFr['Passwords'] -> 'Mots de passe'

/*
    // Easy todo array...
    let trads = {
        uk:  ['Email addresses', 'Passwords', 'Usernames', 'Website activity', 'Password hints', 'Geographic locations', 'Names', 'Professional skills', 'Years of professional experience', 'Employers', 'Job titles', 'Phone numbers', 'Salutations', 'Social media profiles', 'Dates of birth', 'Genders', 'Physical addresses', 'Auth tokens', 'Private messages', 'Bank account numbers', 'Payment histories', 'Browser user agent details', 'Partial credit card data', 'Payment histories', 'Appointments', 'Marital statuses', 'Age groups', 'Purchases', 'User website URLs', 'Income levels', 'Living costs', 'Marital statuses', 'Mothers maiden names', 'Family structure', 'Places of birth', 'Religions', 'Spouses names', 'Profile photos', 'Password strengths', 'Device information', 'Financial transactions', 'Driver\'s licenses', 'Vehicle details', 'Spoken languages', 'Time zones', 'Encrypted keys', 'Mnemonic phrases', 'IMEI numbers', 'SMS messages', 'Home ownership', 'Net worths', 'Occupations', 'Personal interests', 'Ethnicities', 'Survey results', 'Government issued IDs', 'Nationalities', 'Deceased statuses', 'Social connections', 'Payment methods', 'Family members\' names', 'Credit cards', 'Support tickets', 'Avatars', 'Homepage URLs', 'Instant messenger identities', 'IP addresses', 'Security questions and answers', 'Device usage tracking data', 'Historical passwords', 'Account balances'],
        fr: ['Adresses e-mail', 'Mots de passe', 'Noms d\'utilisateur', 'Activité du site Web', 'Indices de mot de passe', 'Emplacements géographiques', 'Noms', 'Compétences professionnelles', 'Années d\'expérience professionnelle', 'Employeurs', 'Titres d\'emploi', 'Numéros de téléphone', 'Salutations', 'Profils de médias sociaux', 'Dates de naissance', 'Sexes', 'Adresses physiques', 'Jetons d\'authentification', 'Messages privés', 'Numéros de compte bancaire', 'Historique des paiements', 'Détails de l\'agent utilisateur du navigateur', 'Données partielles de carte de crédit', 'Historique des paiements', 'Rendez-vous', ' Statuts matrimoniaux', 'Groupes d\'âge', 'Achats', 'URL des sites Web des utilisateurs', 'Niveaux de revenus', 'Coûts de vie', 'Etats matrimoniaux', 'Noms de jeune fille des mères', 'Structure familiale', 'Lieux de naissance', 'Religions', 'Noms des conjoints', 'Photos de profil', 'Forces du mot de passe', 'Informations sur l\'appareil', 'Transactions financières', 'Permis de conduire', 'Détails du véhicule', 'Langues parlées', 'Heure zones', 'Clés cryptées', 'Phrases mnémoniques', 'Numéros IMEI', 'Messages SMS', 'Accès à la propriété', 'Valeurs nettes', 'Professions', 'Intérêts personnels', 'Ethnies', 'Résultats de l\'enquête' , 'Pièces d\'identité émises par le gouvernement', 'Nationalités', 'Statuts de décès', 'Connexions sociales', 'Modes de paiement', 'Noms des membres de la famille', 'Cartes de crédit', 'Tickets d\'assistance', 'Avatars', 'Page d\'accueil URL', 'Identités de messagerie instantanée', 'Adresses IP', 'Questions et réponses de Sécurité', 'Données de suivi de l\'utilisation de l\'appareil', 'Mots de passe historiques', 'Soldes de compte']
    };
    let tradUk = (word) => trads.fr[trads.uk.findIndex(trad => trad == word)] || word; // tradUk('Passwords') -> 'Mots de passe'

    // Print pré-calculated array in JSON in the console...
    let tradClassesFr = {}; trads.uk.map((trad, i) => tradClassesFr[trad] = trads.fr[i]);
    console.log(tradClassesFr); // -> Copy in the console
*/

// Haveibeenpwned ///////////////////////////////
// https://github.com/wKovacs64/hibp/blob/develop/API.md  
// https://haveibeenpwned.com/API/v3#Authorisation  

const hibpApiConfig = { 
    apiKey           : '022********************83f',
    userAgent        : 'Bytel-IHBP 0.1',   // https://haveibeenpwned.com/API/v2#UserAgent
    truncate         : false,              // truncate the results to only include the name of each breach (default: true)
    includeUnverified: true                // All the breaches
};

const checkEmail = function(email) { // username or email address
    return new Promise((resolve, reject) => {
        return hibp
            .search(email, hibpApiConfig)
            .then(data => {
                if (data.breaches || data.pastes) {
                    console.log('Bad news — pwnage found for : ', email, ', breaches : ', data.breaches && data.breaches.length, 'pastes : ', data.pastes && data.pastes.length);
                } else {
                    console.log('Good news — no pwnage found for : ', email);
                }
                resolve(data);
            })
            .catch(err => {
                console.log('Erreur : ', err);
                return reject(err);
            });
    });
};

// reCAPTCHA V3  ///////////////////////////////
// https://www.google.com/recaptcha/admin/site/475400798/

const secretKey ='6LdeClYcA********************v2ysE4YsZ';
const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=`;

// Server ///////////////////////////////

const port       = process.env.PORT || 8000;
const publicPath = path.join(__dirname, '../', 'public');
const app        = express();
const rateLimit  = 1500; // Par heure
let   count      = 0;

setInterval(() => count = 0, 1000 * 60 * 60); // Reset count max 1500 each hour

const routerPostForm = async function(req, res, next) { // https://ihavebp.eu.ngrok.io/form
    console.log('POST > /form'); // , req.body, req.query, req.params); //  userEmail=molokoloco%40gmail.com
    
    if (count > rateLimit) {
        console.log('Rate limit : ', count);
        return res.send({response: 'Rate limit, retry in a moment'});
    }
    count++;

    let userEmail = req.body.userEmail;
    if (!userEmail) return res.send({response: 'Vous devez spécifier un mail'});

    // reCAPTCHA v3
    const token = req.body.token;
    if (!token) return res.send({response: 'Token reCAPTCHA non trouvé'});

    return axios
        .post(recaptchaUrl+token)
        .then(async (repGoogle) => {

            if (!repGoogle.data) {
                return res.send({response: 'Erreur reCAPTCHA ?'});
            }

            if (repGoogle.data.success && repGoogle.data.score > 0.4 && repGoogle.data.action == 'submitHibp') {

                let result = await checkEmail(userEmail); // OK !!! Go API HIBP
                
                if (result.breaches) {
                    let tradsKeys = [];
                    let tradsIndexes = [];
                    let tradsValues = [];

                    result.breaches.map((breach, index) => {
                        // Traductions Google
                        let tradKey = breach.Name + breach.BreachDate; // Unique KEY name for breach 
                        if (!tradDescrFr[tradKey]) {
                            tradsKeys.push(tradKey); // Stock le nom de clé de l'élément (Fichier JSON cache local)
                            tradsIndexes.push(index); // Stock l'index de l'élément non traduit (Index dans result.breaches)
                            tradsValues.push(breach.Description); // Stock la traduction à faire (result.breaches[i].description)
                        }
                        else {
                            breach.DescriptionFr = tradDescrFr[tradKey]; // Traduction existante (Fichier JSON cache local)
                        }
                        // Traductions Custom
                        breach.DataClasses = breach.DataClasses.map(word => tradClassesFr[word] ? tradClassesFr[word] : word); // tradUk(word) 
                        return breach;
                    });

                    if (tradsValues.length) { // Nouvelles Traductions Google ?
                        let tradsValuesFr = await getFrenchTranslation(tradsValues); // Pass array of values to traduce
                        if (tradsKeys.length === 1) {
                            tradDescrFr[tradsKeys[0]] = tradsValuesFr;
                            result.breaches[tradsIndexes[0]].DescriptionFr = tradsValuesFr; 
                        }
                        else {
                            tradsValuesFr.forEach((val, index2) => { // Update globales trads
                                tradDescrFr[tradsKeys[index2]] = val; // JSON cache
                                result.breaches[tradsIndexes[index2]].DescriptionFr = val; // Current Response
                            });
                        }
                        fs.writeFile(tradDescrFrFile, JSON.stringify(tradDescrFr), (err) => { // Write file Async for later use
                            if (err) console.log('Error writting Trads to file', err);
                            else console.log('Trads file updated : ', Object.keys(tradDescrFr).length, ' entrées');
                        });
                    }
                }
                return res.send({response: result});
            }
            else {
                return res.send({response: 'Requête reCAPTCHA non vérifiée :-/'});
            }
        })
        .catch(error => {
            console.log('reCAPTCHA error', error)
            return res.send({response: error || 'reCAPTCHA error'});
        });
};

app
    //.use(logger())
    .use(express.static(publicPath))
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json())
    .use(methodOverride())
    .post('/form', routerPostForm)
    .get('/test', (req, res) => { // TEST HIBP !
        console.log('GET > /test');
        checkEmail('test@test.com'); // Test API call with > http://ihavebp.eu.ngrok.io/test
        return res.send('User test : test@test.com (see console for logs)');
    })
    .use(function(req, res) { // All ohters URL
        res.status(404).end('');
    });

let server = http.createServer(app).listen(port, () => {
    let host = server.address().address;
    if (host == '::') host = 'localhost';
    let url = 'http://'+ host + ':' + port;
    console.log(process.platform + ' as server running on ' + url);
    initGoogleTranslation();
});