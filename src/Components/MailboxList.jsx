import React, {useState} from 'react'
import { List, Grid } from 'semantic-ui-react'
import ReactTimeAgo from 'react-time-ago'

// this is a weird error happening with RxDB, but if uncaught execution stops
// Uncaught (in promise) TypeError: Method get TypedArray.prototype.length called on incompatible receiver [object Object]
// note that update performs a deep-comparison before making any changes
// not sure if this is a problem with RxDB or the timing of the Promise
async function selectMessage(selectedMessage, setSelectedMessage) {
  console.dir(selectedMessage)
  if (selectedMessage && selectedMessage.hasBeenRead === false) {
    await selectedMessage.update({
      $set: {
        hasBeenRead: true
      }
    })
  }
  setSelectedMessage(selectedMessage)
}

export default function MailboxList({ messages, selectedMessage, setSelectedMessage }) {
  const [spamScoreThreshold, setSpamScoreThreshold] = useState(5)

  return (
    <List className='mailbox' selection divided relaxed='very'>
      {messages.map((message, index) => {

        return (
          <List.Item
            key={message.messageId}
            active={message === selectedMessage}
            onClick={() => { selectMessage(message, setSelectedMessage) }}
          >
            <List.Content>
              <Grid>
                <Grid.Row>
                  {/* status buttons */}
                  <Grid.Column width={1}>
                    {(message.spamScanner.spamScore >= spamScoreThreshold) &&
                      <List.Icon name='circle' size='small' verticalAlign='middle' color="yellow" />}

                    {message.hasBeenRead === false &&
                      <List.Icon name='circle' size='small' verticalAlign='middle' color="blue" />}
                  </Grid.Column>
                  <Grid.Column width={15}>
                    <Grid>
                      {/* top line */}
                      <Grid.Row style={{ paddingBottom: ".5rem" }}>
                        <Grid.Column width={11}>
                          <List.Header as='a'>{message.from && message.from.text}</List.Header>
                        </Grid.Column>
                        <Grid.Column width={5} style={{ fontSize: ".85em" }} textAlign="right">
                          <ReactTimeAgo date={message.date} />
                        </Grid.Column>
                      </Grid.Row>
                      {/* second line */}
                      <Grid.Row style={{ paddingTop: 0 }}>
                        <Grid.Column>
                          <List.Description as='a'>{message.subject && message.subject}</List.Description>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </List.Content>
          </List.Item>
        );
      })}
    </List>
  );
}