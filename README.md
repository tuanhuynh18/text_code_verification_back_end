# Endpoints

https://us-central1-phone-access-code.cloudfunctions.net/app/getAccessCode - expecting input json {"phoneNumber": "+[country code][area code + number]"} // without space or '-'
https://us-central1-phone-access-code.cloudfunctions.net/app/verifyAccessCode -expecting input json {"phoneNumber": "+[country code][area code + number]", "accessCode": "access_code_here"} // without space or '-' in phone number
