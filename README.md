MockingJS
=========

Setup one Twitter account to echo the tweets of another Twitter account. With some humor thrown in.

Inspired by [@echofat](http://twitter.com/echofat).

## Example

Tweet input:

`Sometimes I try to have conversations with people about industrial design but they just think I’m making fun of the stuff in their house.`

MockingJS output:

`Sometimes I try to have sweet with people when industrial Bootstrap but they just think I’m baked with of the stuff in their GitHub.`

## How it works

MockingJS setup requires three things:

- Twitter application keys
- Access tokens for the user's normal account, *Marco*
- Access tokens for the account that echoes, *Polo*

The Twitter application listens for Marco's tweets and forwards them to Polo's account, mixing up Marco's words for a bit of humor.

## Installation

*Only prerequisit is NodeJS.*

1. Clone the repo
   - `git clone git@github.com:JacksonGariety/MockingJS.git`
   - `cd MockingJS`
2. Install dependencies
   - `npm install`
3. Setup an application on [dev.twitter.com](http://dev.twitter.com/)
4. Get two Twitter access tokens, one for Marco and one for Polo
   - `gem install twitter_oauth`
   - `wget https://gist.github.com/mirakui/388067/raw/30639089bf4cf3be179c48b1e7f623eb68ba1552/make_token.rb`
   - Sign into Marco's account
   - `ruby make_token.rb`
   - Sign into Polo's account
   - `ruby make_token.rb`
5. Put your app's consumer keys (acquired in step 2), Marco's access tokens, and Polo's access tokens (each acquired in step 3) into `config.example.json`
   - `nano config.example.json`
   - `mv config.example.json config.json`
6. Start your application
   - `nohup node mocking.js`
   - Let the bot run as long as you want, `nohup` lets you close the shell session!