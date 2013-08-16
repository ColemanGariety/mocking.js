// Dependencies
var Twitter = require('twit'),
    Pos = require('pos'),
    config = require('./config.json'),
    ent = require('ent')

// Connect to both marco's account and polo's account
var marco = new Twitter({ consumer_key: config.consumer_key, consumer_secret: config.consumer_secret, access_token: config.marco_access_token, access_token_secret: config.marco_access_token_secret }),
    polo = new Twitter({ consumer_key: config.consumer_key, consumer_secret: config.consumer_secret, access_token: config.polo_access_token, access_token_secret: config.polo_access_token_secret })

// Setup empty arrays to store parts of speech (staying global for a neat mapping hack)
var parts = { "JJ": [], "JJR": [], "JJS": [], "NN": [], "NNP": [], "NNPS": [], "NNS": [], "RB": [], "RBR": [], "RBS": [], "RP": [], "VB": [], "VBD": [], "VBG": [], "VBN": [], "VBP": [], "VBZ": [] }
    
// A helpful public method for flattening multidimensional arrays
var flatten = function(array){
  var flat = [];
  for (var i = 0, l = array.length; i < l; i++){
    var type = Object.prototype.toString.call(array[i]).split(' ').pop().split(']').shift().toLowerCase();
    if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten(array[i]) : array[i]); }
  }
  return flat;
}

// Listen for marco's tweets
var listen = marco.stream('user')
listen.on('tweet', function(tweet) {
  if (tweet.text.substring(0,18) != "RT @" + config.polo_screen_name) {
    // Grab Marco's last 25 tweets (using polo's account to exclude replies)
    polo.get('statuses/user_timeline', { screen_name: config.marco_screen_name, count: 25, exclude_replies: false }, function(err, tweets) {
      var tweet = tweets.shift(),
          i = tweets.length
      
      if (i) {
        // Loop through the words in the historic tweets
        while (i--) {
          var lexicon = new Pos.Lexer().lex(tweets[i].text),
              words = new Pos.Tagger().tag(lexicon),
              j = words.length
          
          while (j--) {
            var tag = words[j],
                word = tag[0],
                part = tag[1]
            
            // Sort the array by part of speech
            var pos = parts[part]
            if (pos) {
              if (word.match(/(^|\W+)\@([\w\-]+)/gm)) {
                pos.push(config.people[Math.floor(Math.random() * config.people.length)])
              } else if (config.blacklist.indexOf(word) == -1) {
                pos.push(word)
              }
            }
          }
        }
        
        // Loop through words in the present tweet
        var lexicon = new Pos.Lexer().lex(tweet.text),
            words = new Pos.Tagger().tag(lexicon),
            k = words.length
        
        while (k--) {
          var tag = words[k],
              word = tag[0],
              part = tag[1]
          
          // Swap out words with a bit of randomization
          var pos = parts[part]
          if ([".", ",", ";", "—", '!', ':'].indexOf(word) != -1) {
            words[words.indexOf(tag) - 1][0] += word
            words[words.indexOf(tag)] = ["", ""]
          } else if (words[k][0].match(/(^|\W+)\@([\w\-]+)/gm)) {
            tweet.text.replace(words[k][0], config.people[Math.floor(Math.random() * config.people.length)])
          } else if (Math.random() <= .33 && pos) {
            // Get a random word by part of speech and replace the original tweet with it
            tweet.text.replace(words[k][0], pos[Math.floor(Math.random() * pos.length)]
          }
        }
        
        // Polo tweets a new message
        console.log("Tweeting... \n" + text)
        polo.post('statuses/update', { status: tweet.text }, function(err, reply) {
          if (err) console.log(err)
        })
      }
    })
  }
})