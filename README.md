# open-baba
A simple browser clone of the Baba Is You rules-as-gameplay game mechanic

![Screenshot from 2019-07-11 23-05-03](https://user-images.githubusercontent.com/2522620/61088550-851a7580-a430-11e9-80ab-cf4b1bdb9a56.png)

## Running it

- Clone this repository
- `cd open-baba && npm install`
- `npm start`

## Game objects

Everything is a Noun or an Adjective.

Nouns consist of a name, an image for the text component and an image for the entity component. The hold a bag of adjectives that dictate their collision interactions with other bags-of-adjectives (nouns)

Adjectives consist of a name, an image for the text component and a set of rules for when other adjectives collide with them. At present there are a preset number of responses to a collision, and only "is-moved" and "stop" have been implemented.

A level is specified with a width, height, a set of Nouns and a set of Adjectives. An adjective has its rule set specified as part of its inclusion in a level, and so can operate differently between levels. The actual rules are either `internal` (a pointer to a core-rule, which is currently 'push' or 'you') or they are `inline`, in which case the decision hash is stored as part of the level.

If this doesn't make sense, check `ser/data/testlevel1.json` for the level from the above screenshot, and `src/data/adjectives/*.json` for example adjective descriptors.

## Principles

Everything is fully dynamic with the exception of the connectors (currently "is", but in future other connectors such as "and" may be implemented). By including a noun with the name "text", the properties of the text itself can also be changed (By default, it uses an internal noun that only has the "push" adjective)
