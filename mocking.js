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
    
// A helpful public method for arrays
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
// listen.on('tweet', function(tweet) {
  // Grab Marco's last 10 tweets (using polo's account to exclude replies)
  polo.get('statuses/user_timeline', { screen_name: 'JacksonGariety', count: 10, exclude_replies: true }, function(err, tweets) {
    var tweet = tweets.shift(),
        i = tweets.length
    
    if (i) {
      // A simple script to get a random word by its part of speech
      function getRandom(pos) {
        var index = pos[Math.floor(Math.random() * pos.length)]
        return pos[index]
      }
      
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
          if (pos) pos.push(word)
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
        if (Math.random() <= .5) {
          // Get a random word by part of speech
          var pos = parts[part]
          if (pos) words[k][0] = pos[Math.floor(Math.random() * pos.length)]
        }
      }
      
      // De-lexify it
      var l = words.length
      while (l--) {
        words[l].splice(1,1)
      }
      
      var words = flatten(words),
          text = ent.decode(words.join(' ').replace(/@/g, '').substring(0, 140))
      
      // Polo tweets a new message
      console.log("Tweeting... \n" + text)
      polo.post('statuses/update', { status: text }, function(err, reply) {
        if (err) console.log(err)
      })
    }
  })
// })