// Dependencies
var Twitter = require('twit'),
    Pos = require('pos'),
    config = require('./config.json')

// Connect to both marco's account and polo's account
var marco = new Twitter({ consumer_key: config.consumer_key, consumer_secret: config.consumer_secret, access_token: config.marco_access_token, access_token_secret: config.marco_access_token_secret }),
    polo = new Twitter({ consumer_key: config.consumer_key, consumer_secret: config.consumer_secret, access_token: config.polo_access_token, access_token_secret: config.polo_access_token_secret })

// Listen for marco's tweets
var listen = marco.stream('user')
listen.on('tweet', function(tweet) {
  // Grab Marco's last 10 tweets (using polo's account to exclude replies)
  polo.get('statuses/user_timeline', { screen_name: 'JacksonGariety', count: 10, exclude_replies: true }, function(err, tweets) {
    var tweet = tweets.shift(),
        i = tweets.length
    
    if (i) {
      var adjectives = [],
          nouns = [],
          verbs = []
      
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
          if (part == "JJ") { adjectives.push(word) }
          else if (part == "NN" || part == "NNP") { nouns.push(word) }
          else if (part == "VB") { verbs.push(word) }
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
        if (Math.random() <= .25) {
          var pos
        
          if (part == "JJ") { pos = adjectives }
          else if (part == "NN" || part == "NNP") { pos = nouns }
          else if (part == "VB") { pos = verbs }
          
          // Get a random word by part of speech
          words[k] = pos[Math.floor(Math.random() * pos.length)]
        }
      }
      
      // De-lexify it
      text = words.join(" ")
      
      // Polo tweets a new message
      polo.post('statuses/update', { status: text }, function(err, reply) {
        if (err) {
          console.log(err)
          return false
        }
        
        console.log("Tweeting... \n" + reply)
      })
    }
  })
})