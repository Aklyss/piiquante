const passwordValidator = require("password-validator");

const schemaPassword = new passwordValidator();

schemaPassword
    .is().min(8)                                    // Minimum length
    .is().max(50)                                  // Maximum length
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                // Must have digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123', 'Azerty123']); // Blacklist these values

    module.exports = (req, res, next) => {
        if(schemaPassword.validate(req.body.password)){
            next()
        }else{
            return res.status(400).json({error: `Le mot de passe n'est pas assez fort ${schemaPassword.validate(req.body.password, {list:true})}`})
        }
    }