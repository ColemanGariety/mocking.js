var Twit = require('twit'),
    Pos = require('pos'),
    consumer_key = 'BPIzUvAYt42eASw0uZeOJg',
    consumer_secret = 'Tkd7BpS1a193j1pYsDBjszHypTeUojEnbL5qrzts'

// Connect to the human's account
marco = new Twit({
  consumer_key:        consumer_key,
  consumer_secret:     consumer_secret,
  access_token:        '248558843-dr1pQWqzvinSyM6RQt7lUomNsYuIJJEVDJ7CsL5M',
  access_token_secret: '3Q7aOd5bLlamPOS7JZtfnQrF7Btdby6YasiLfVOvGg'
})

// Connect to the mocking jay's account
polo = new Twit({
  consumer_key:        consumer_key,
  consumer_secret:     consumer_secret,
  access_token:        '248558843-dr1pQWqzvinSyM6RQt7lUomNsYuIJJEVDJ7CsL5M',
  access_token_secret: '3Q7aOd5bLlamPOS7JZtfnQrF7Btdby6YasiLfVOvGg'
})

// Listen for marco's tweets
var listen = marco.stream('user')
listen.on('tweet', function(tweet) {
  // Grab marco's last 10 tweets

  var words = new Pos.Lexer().lex(tweet.text),
      tagged = new Pos.Tagger().tag(words)
  
  console.log(tagged)
})