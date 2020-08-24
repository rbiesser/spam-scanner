const nlp = require('compromise').default
nlp.extend(require('compromise-scan').default)

// run spam scanner on one message at a time and return list of matches
export function RunSpamScanner(message, spamWords) {

  // convert spam words from RxDB document to plain array
  let searchWords = spamWords.map(word => {
    return word.value
  })

  let trie = nlp.buildTrie(searchWords)

  try {
    let doc = nlp(message.text)

    // will return empty array ([]) if trie not found
    let result = doc.scan(trie)

    // console.log(result)

    let spamScannerResults = { spamScore: 0, spamWords: [] }

    if (result.length > 0) {
      spamScannerResults.spamWords = result.json({ count: true, unique: true })

      console.dir(spamScannerResults)

      let spamScore = 0
      spamScannerResults.spamWords.map(foundWord => {
        spamWords.map(allWords => {
          spamScore += foundWord.reduced == allWords.value ? allWords.weight * foundWord.count : 0
        })
      })

      spamScannerResults.spamScore = spamScore
    }

    return spamScannerResults

  } catch (error) {
    console.log(message)
    console.error(error)
  }
}