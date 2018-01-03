var express = require('express');
var router = express.Router();
var _ = require('lodash');
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://postgres:Qwert!2345@localhost:5432/words')

/* GET home page. */
router.post('/search', function(req, res, next) {
  var params = req.body;
  var sql = "SELECT DISTINCT words FROM words WHERE len=$1 and words ~ $2";
  db.query(sql,[params.len, getRegex(params.letters)])
  .then(function (data) {
    console.log('DATA:', data)
    var counts = getCounts(params.letters.split(''))
    res.json(checkMultiLetters(data, counts));
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })
});

function getRegex(letters) {
	var _letters = letters.split('');
	var count = getCounts(_letters);
	var uniqeLetters = _.uniq(_letters)
	var regexLetter = '';
	uniqeLetters.forEach((letter) => {
		if (count[letter] == 1) {
			regexLetter += '(?!.*'+ letter +'.*'+ letter +')'
		}
	})
	return '^'+ regexLetter +'['+ letters +']*$';
}

function checkMultiLetters(words, counts) {
	var _copyWords = _.cloneDeep(words)
	_copyWords.forEach((word, index) => {
		var wordCounts = _.countBy(word.words.split(''))
		console.log(word)
		Object.keys(wordCounts).some((key) => {
			console.log(wordCounts[key] + ' ' + counts[key]);
			if (wordCounts[key] > counts[key]) {
				console.log('usuwam')
				_.remove(words, word)
				return true;
			}
		});
	});
	return words;
}

function getCounts(letters) {
	return _.countBy(letters);
}

module.exports = router;
