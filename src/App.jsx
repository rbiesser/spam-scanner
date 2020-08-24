import React, { useState, useEffect } from 'react'
import './App.css'
import { Grid, Header } from 'semantic-ui-react'

// Components
import Toolbar from './Components/Toolbar'
import MailboxList from './Components/MailboxList'
import MessageReader from './Components/MessageReader'

import { getDatabase } from './Config/Database'

function App() {

  const [messages, setMessages] = useState([])
  const [spamWords, setSpamWords] = useState([])
  const [selectedMessage, setSelectedMessage] = useState({})

  const subs = []

  // load database when the app first starts
  useEffect(() => {
    console.log('loading database')

    async function fetchData() {
      const db = await getDatabase('mailbox', 'idb');

      const swsub = db.spamwords.find()
        // .sort({ weight: 'asc' })
        .$.subscribe(words => {
          if (!words) {
            return;
          }
          console.log('reload words list ');
          console.dir(words);

          setSpamWords(words)
        })

      subs.push(swsub)

      const msub = db.messages.find()
        .sort({ date: 'desc' })
        .$.subscribe(messages => {
          if (!messages) {
            return;
          }
          console.log('reload messages list')
          console.dir(messages)

          setMessages(messages)
        })

      subs.push(msub)
    }

    fetchData()

    // cleanup subscriptions
    return (() => {
      console.log('unsubscribe database')
      subs.map(sub => sub.unsubscribe())
    })
  }, [])

  useEffect(() => {
    console.log("selected message")
  }, [selectedMessage])

  useEffect(() => {
    console.log('messages or words have changed in App')
  }, [messages, spamWords])

  return (
    <Grid>
      <Grid.Row style={{ paddingBottom: 0 }}>
        <Grid.Column width={16}>
          <Toolbar messages={messages} spamWords={spamWords} />
        </Grid.Column>
      </Grid.Row>

      <Grid.Row style={{ paddingTop: 0 }}>
        <Grid.Column width={5} style={{ paddingRight: 0 }}>
          {JSON.stringify(messages) === '[]' ?
            <Header className="importHint"
              size="large"
              inverted
              color="grey"
              style={{ paddingTop: '40vh' }}
              textAlign="center"
              content="Mailbox Empty"
            />
            : <MailboxList messages={messages} selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage} />
          }
        </Grid.Column>

        <Grid.Column width={11}>
          {JSON.stringify(selectedMessage) === '{}' ?
            <Header
              size="large"
              inverted
              color="grey"
              style={{ paddingTop: '40vh' }}
              textAlign="center"
              content="No Message Selected"
            />
            : <MessageReader selectedMessage={selectedMessage} />
          }
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default App;
