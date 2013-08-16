// Dependencies
var Twitter = require('twit'),
    Pos = require('pos'),
    config = require('./config.json'),
    ent = require('ent')

// Connect to both marco's account and polo's account
var marco = new Twitter({ consumer_key: config.consumer_key, consumer_secret: config.consumer_secret, access_token: config.marco_access_token, access_token_secret: config.marco_access_token_secret }),
    polo = new Twitter({ consumer_key: config.consumer_key, consumer_secret: config.consumer_secret, access_token: config.polo_access_token, access_token_secret: config.polo_access_token_secret })

// Setup empty arrays to store parts of speech (staying global for a neat mapping hack)
var parts = { "JJ": [], "NN": [], "NNP": [], "NNPS": [], "NNS": [], "VB": [], "VBG": [], "VBN": [], "RB": [], "RBR": [], "RBS": [] },
    people = [],
    blacklist = ["i", "a", ".a", "it's", "rt", "am", "pm", "mt", "an", "the"],
    mention = /(^|\W+)\@([\w\-]+)/gm

// Listen for marco's tweets
var listen = marco.stream('user')
listen.on('tweet', function(tweet) {
  if (tweet.user.screen_name == config.marco_screen_name && tweet.text.substring(0,18) != "RT @" + config.polo_screen_name) {
    // Grab Marco's last 25 tweets (using polo's account to exclude replies)
    polo.get('statuses/user_timeline', { screen_name: config.marco_screen_name, count: 25, exclude_replies: false }, function(err, tweets) {
      if (err) {
        console.log(err)
        return false
      }

      var tweet = tweets.shift(),
          i = tweets.length
      
      if (i) {
        while (i--) { // Loop through historic tweets
          var lexicon = new Pos.Lexer().lex(tweets[i].text),
              words = new Pos.Tagger().tag(lexicon),
              j = words.length
          
          while (j--) { // Loop through the words in the historic tweets
            var tag = words[j],
                word = tag[0],
                part = tag[1]
            
            // Sort the array by part of speech
            if (parts[part] && blacklist.concat(parts[part]).indexOf(word.toLowerCase()) == -1 && !word.match(mention)) {
              parts[part].push(word)
            }
          }
        }
          
        // Lexify & tag the present tweet
        var lexicon = new Pos.Lexer().lex(tweet.text),
            words = new Pos.Tagger().tag(lexicon),
            l = words.length
        
        // Search for relevant tweets
        polo.get('search/tweets', { q: parts["NN"][Math.floor(Math.random() * parts["NN"].length)], count: 46 }, function(err, res) {
          if (err) {
            console.log(err)
            return false
          }

          var tweets = res.statuses,
              k = tweets.length
          while (k--) { // Loop over the tweets and save the users
            people.push(tweets[k].user.screen_name)
          }
          
          
          while (l--) { // Loop through words in the present tweet
            var tag = words[l],
                word = tag[0],
                part = tag[1]
            
            // Swap out words with a bit of randomization
            var pos = parts[part]
            if (words[l][0].match(mention)) { // If it's an @mention change it to one of the users we grabbed before
              tweet.text = tweet.text.replace(words[l][0], "@" + people[Math.floor(Math.random() * people.length)])
            } else if (Math.random() <= .66 && pos) {
              // Get a random word by part of speech and replace the original tweet with it
              tweet.text = tweet.text.replace(words[l][0], pos[Math.floor(Math.random() * pos.length)])
            }
          }
          
          // Polo tweets a new message
          console.log("Tweeting... \n" + tweet.text)
          polo.post('statuses/update', { status: tweet.text }, function(err, reply) { if (err) console.log(err)  })
        })
      }
    })
  }
})