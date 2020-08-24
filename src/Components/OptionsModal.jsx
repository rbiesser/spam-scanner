import React, { useState, useEffect } from 'react'
import {
  Button
  , Modal
  , Icon
  , Label
  , Segment
  , Form
  , Grid
} from 'semantic-ui-react'

import SliderComponent from './SliderComponent'

import { getDatabase } from '../Config/Database'
import { RunSpamScanner } from '../Config/SpamScanner'

export default function OptionsModal({ spamWords }) {
  const defaultWeight = 1
  const [open, setOpen] = useState(false)
  // it is possible to use objects and update with the spread syntax
  // but it is just as easy to keep multiple state variables
  // https://reactjs.org/docs/hooks-reference.html#functional-updates
  const [selectedWord, setSelectedWord] = useState("");
  const [selectedWeight, setSelectedWeight] = useState(defaultWeight)
  const [doneButtonState, setDoneButtonState] = useState({ disabled: false })
  const [spamScoreThreshold, setSpamScoreThreshold] = useState(5)

  function removeWord(spamWord) {
    console.log(spamWord)
    // call the RxDB document method
    spamWord.remove()
  }

  // adding new or updating word
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWord)
      return

    const db = await getDatabase('mailbox', 'idb');

    // nlp only matches lowercase so make sure to insert lowercase
    db.spamwords.upsert({
      value: selectedWord.toLowerCase(),
      weight: selectedWeight
    })

    setSelectedWord("")
    setSelectedWeight(defaultWeight)
  }

  const doneClicked = async (e) => {
    setDoneButtonState({ disabled: false, loading: true })
    e.preventDefault()

    const db = await getDatabase('mailbox', 'idb')

    try {
      await db.messages.find()
        .exec()
        .then(async (messages) => {
          // RxDB doesn't have a bulk update and likely never will, 
          // it is following PouchDB releases
          // instead left with updating messages one at a time.
          messages.map((message, index) => {
            message.update({
              $set: {
                spamScanner: RunSpamScanner(message, spamWords)
              }
            })
          })
        })
    } catch (error) {
      console.error(error)
    }
    setDoneButtonState({ disabled: false, loading: false })
    setOpen(false)
  }

  useEffect(() => {
    // run spam scanner as soon as the modal closes
    if (open === false) {
      console.log('run spam scanner')
    }
  }, [open])

  return (
    <Modal
      centered={false}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button><Icon name="cog" />Manage Spam Words</Button>}
    >
      <Modal.Header>Manage Spam Words</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Grid>

            <Grid.Row columns={2}>
              <Grid.Column width={6}>
                <Form size="large">
                  <Form.Field inline>
                    <label>Spam Score Threshold</label>
                    <input type="number" value={spamScoreThreshold}
                      disabled
                      style={{ width: "6em" }}
                      onChange={() => { }}
                    />
                  </Form.Field>
                </Form>
              </Grid.Column>

              <Grid.Column width={10}>
                <Segment tertiary>
                  A Spam Score is calculated for each message using the words and weights found below.
                </Segment>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row columns={2}>

              <Grid.Column>
                <Form size="large" onSubmit={handleSubmit}>
                  <Form.Field>
                    <label>Enter a word or phrase and give it a weight. (default: 1)</label>
                    <input size={10} placeholder='This is a word usually found in a spam message.'
                      value={selectedWord}
                      onChange={e => setSelectedWord(e.target.value)}
                    />
                  </Form.Field>
                  <Button type='submit'>Submit</Button>
                </Form>
              </Grid.Column>

              <Grid.Column>
                <SliderComponent selectedWeight={selectedWeight} setSelectedWeight={setSelectedWeight} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column className="spamWords">
                <Label.Group color='blue'>

                  {spamWords.map((spamWord, index) => {
                    return (
                      <Label as="a" size="large" key={index}
                        onClick={() => {
                          setSelectedWord(spamWord.value);
                          setSelectedWeight(spamWord.weight)
                        }}
                      >
                        {spamWord.value}
                        <Icon name='delete'
                          onClick={(e) => { removeWord(spamWord) }} />
                      </Label>
                    );
                  })}
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
          onClick={doneClicked}
          positive
          disabled={doneButtonState.disabled}
          loading={doneButtonState.loading}
        />
      </Modal.Actions>
    </Modal>
  )
}
