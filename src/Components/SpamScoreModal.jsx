import React, { useState, useEffect } from 'react'
import {
  Button
  , Header
  , Modal
  , Icon
  , Label
  , Grid
} from 'semantic-ui-react'

export default function SpamScoreModal({ message }) {
  const [open, setOpen] = useState(false)
  const [spamScoreThreshold, setSpamScoreThreshold] = useState(5)
  const spamScoreScale = 10

  useEffect(() => {
    console.log(message.spamScanner)
  }, [])

  const modalAlertStyle = {
    backgroundColor: "#dddddd",
    cursor: "pointer"
  }

  let modalMessage = "Click this bar to see the Spam Score."
  if (message.spamScanner.spamScore >= spamScoreThreshold) {
    modalMessage = "This message appears to be spam. " + modalMessage
    modalAlertStyle.backgroundColor = "#fccb00"
  }

  return (
    <Modal
      centered={false}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Grid.Row className="alert" style={modalAlertStyle}>
        <Grid.Column>
          <Icon name="exclamation circle" />{modalMessage}
          </Grid.Column>
        </Grid.Row>
        }
    >
      <Modal.Header>Spam Score</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Grid>
            <Grid.Row columns={2}>

              <Grid.Column>
                <Header as="h1">Spam Score: {`${message.spamScanner.spamScore} / ${spamScoreScale}`}</Header>
              </Grid.Column>
              <Grid.Column>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Label.Group color='blue'>
                  {message.spamScanner.spamWords.map((word, index) => {
                      return (
                        <Label key={index} size="large">{word.reduced}
                          <Label.Detail>
                            {word.count}
                          </Label.Detail>
                        </Label>
                      )
                    })
                  }
                </Label.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Done"
          labelPosition='right'
          icon='checkmark'
          onClick={() => setOpen(false)}
          positive
        />
      </Modal.Actions>
    </Modal>
  )
}
