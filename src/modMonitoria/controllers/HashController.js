const crypto = require('crypto'), algorithm = 'aes-256-cbc', password = 'bravolog2017', passwordLogin = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';

module.exports = function (app, cb) {

  var api = {};

  api.encrypt = async function (text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  };

  api.decrypt = async function (text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  };

  api.encryptLogin = function (text) {
    var cipher = crypto.createCipher(algorithm, passwordLogin);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  };

  api.decryptLogin = function (text) {
    var decipher = crypto.createDecipher(algorithm, passwordLogin);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  };

  return api;
};