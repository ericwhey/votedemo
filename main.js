var hash = require('hash.js');
var EC = require('elliptic').ec;
var utils = require('hash.js').utils;

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

window.createVote = function(title, choices) {

    var ec = new EC('secp256k1');

    //var storedPrivate = localStorage.private;
    var key;
    var address;

    key = ec.genKeyPair();

    address = hash.sha256().update(utils.toArray(key.getPublic(true,'hex'),'hex')).digest('hex');

    var rnd = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    //var json = document.getElementById('transaction').value;
    var json = '{"transaction":{"realm":"cotr","nonce":"' + rnd + '","method":"setObject","arguments":{"code":{"extends":"vote","title":"' + title + '","choices":' + JSON.stringify(choices) + '}}}}';
    var obj = JSON.parse(json);
    var txObj = obj.transaction;
    txObj.sender = '0x' + address.toUpperCase();
    txObj.receiver = '0x' + address.toUpperCase();

    var tx = JSON.stringify(txObj);
    var txHash = hash.sha256().update(tx).digest();

    var pubPoint = key.getPublic(true,'hex');
    var private = key.getPrivate('hex');

    var signature = key.sign(txHash);
    var derSign = signature.toDER();

    obj.signature = {"scheme":"ecdsa_sha256","der":toHexString(derSign),"public_key":pubPoint}

    var out = JSON.stringify(obj);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', 'http://cotr.io:8080');
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(out);

    return address;
}


