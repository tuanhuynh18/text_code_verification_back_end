// twilio
const TWILIO_ACCOUNT_SID = "twilio_id_here";
const TWILIO_AUTH_TOKEN = "twilio_auth_token_here";
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const textAccessCode = (receiverPhoneNumber, accessCode) => {
    client.messages
        .create({
            body: accessCode,
            from: '+19388884670',
            to: receiverPhoneNumber
        })
        .then(message => console.log(message.sid))
        .catch(err => console.log(err));
};

// firebase
const PHONE_ACCESS_CODE_DOC = 'phone_access_code';
const ACCESS_CODE_LEN = 6;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// express & middlewares 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// set up middlewares
app.use(cors({origin: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// functions
const createNewAccessCode = phoneNumber => {
    try {
        // initalize with default value 000-000
        let accessCodeVal = new Array(ACCESS_CODE_LEN).fill(0);
        // generate 6 random number
        accessCodeVal = accessCodeVal.map(ele => (Math.floor(Math.random() * 10).toString())).join('');

        // store to database
        db.collection(PHONE_ACCESS_CODE_DOC).doc(phoneNumber).set({accessCode: accessCodeVal});
        return accessCodeVal;
    } catch (err) {
        return null;
    }
};

const validateAccessCode = (accessCode, phoneNumber, res) => {
    db.collection(PHONE_ACCESS_CODE_DOC)
                    .doc(phoneNumber)
                    .get()
                    .then(doc => {
                        // only set flag to true if phone number exist and access code is valid
                        if (doc.exists && doc.data().accessCode === accessCode) {
                            res.status(200).json({isSuccess: true});
                            return true;
                        }
                        res.status(401).json({isSuccess: false});
                        return false
                    }).catch(err => {
                        // handle error when getting document
                        errorMessage = err;
                        res.status(500).json({isSuccess: false});
                        return false;
                    });
};

// API
app.post('/getAccessCode', (req, res) => {
    const phoneNumber = req.body['phoneNumber'];
    const accessCode = createNewAccessCode(phoneNumber);
    const textMessage = "Your access code is " + accessCode;
    if (accessCode !== null) {
        textAccessCode(phoneNumber, textMessage);
        res.status(200).send("Access code has been sent.");
    } else {
        res.status(500).send("Can't create access code.");
    }
});

app.post('/verifyAccessCode', (req, res) => {
    const phoneNumber = req.body['phoneNumber'];
    const accessCode = req.body['accessCode'];
    validateAccessCode(accessCode, phoneNumber, res);
});

// register express with firebase 
exports.app = functions.https.onRequest(app);