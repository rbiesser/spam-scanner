import React, { useState, useEffect } from 'react'
import {
  Button
  , Header
  , Modal
  , Form
  , Grid
  , Segment
  , Icon
  , Message
} from 'semantic-ui-react'

import { getDatabase } from '../Config/Database'
import { RunSpamScanner } from '../Config/SpamScanner'

import filesize from 'filesize'
const simpleParser = require('mailparser').simpleParser

// spamWords is an object of the variable and the setter, so maybe only need one { messages, setMessages }
export default function ImportMailboxModal() {

  const [open, setOpen] = useState(false)
  const [file, setFile] = useState({})
  const [messagesTemp, setMessagesTemp] = useState([])
  const [doneButtonState, setDoneButtonState] = useState({ disabled: true })
  const [selectedMbox, setSelectedMbox] = useState({ isValid: false, msg: "Select an mbox file" })

  // File input onChange event
  const onFileSelected = (e) => {
    console.log(e.target.files)
    setSelectedMbox((selectedMbox) => {
      return { ...selectedMbox, isValid: false, msg: "Not a valid mbox" }
    })
    setDoneButtonState({ disabled: true })
    setFile(e.target.files[0])

    let fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0])

    // loading doesn't take that long
    fileReader.onloadstart = () => { console.log("load started") }
    fileReader.onloadend = () => { console.log('load end') }

    fileReader.onload = function () {
      // console.log(fileReader.result);

      let rawMessages = []
      let rawMessage = ''
      fileReader.result.split('\n').map((line, index) => {
        if (line.startsWith('From ')) {
          // preliminary check for valid mbox file
          // if the first line starts with From , it will be assumed to be valid 
          // until the simpleParser has a chance with the list of messages.
          if (index === 0)
            setSelectedMbox((selectedMbox) => {
              return { ...selectedMbox, isValid: true }
            })

          // a valid mbox file starts with From on the very first line
          if (rawMessage.length) {
            rawMessages.push(rawMessage)
            rawMessage = ""
          } else {
            rawMessage += line + '\n'
          }
        } else {
          // combine into message string
          rawMessage += line + '\n'
        }
      })

      // finally, push last message
      if (rawMessage.length) {
        rawMessages.push(rawMessage)
        rawMessage = ""
      }

      setMessagesTemp(rawMessages)
    };

    fileReader.onerror = function () {
      console.log(fileReader.error);
    };
  }

  // Import button onSubmit event
  const importClicked = (evt) => {
    evt.preventDefault();
    console.log(file)
    setDoneButtonState({ ...doneButtonState, loading: true })

    var results = []
    let parsedMessages = (async function () {
      for (const source of messagesTemp) {

        let parsed = await simpleParser(source);

        // coerce the parsed results to fit RxDB schema
        parsed.messageId = parsed.messageId || new Date().toString()
        parsed.html = parsed.html || ""
        parsed.date = parsed.date && parsed.date.getTime()
        parsed.references = (typeof parsed.references === "string" ? [parsed.references] : parsed.references)

        // console.log(parsed.subject)
        results.push(parsed)
      }
      // console.log(results.length)
      return results
    })()

    // get messages from mailparser
    // scan messages with compromise
    // spam scanner works on one message at a time and returns list of matches
    // insert messages with bulkinsert

    Promise.resolve(parsedMessages).then(async (messages) => {

      const db = await getDatabase('mailbox', 'idb')

      // debugger
      console.dir(messages)
      try {
        await db.spamwords.find()
          .exec()
          .then(async (spamWords) => {
            messages.map((message, index) => {
              messages[index].spamScanner = RunSpamScanner(message, spamWords)
              console.dir(message)
            })

            await db.messages.bulkInsert(messages)

          })

        // })
      } catch (error) {
        console.error(error)
      }

      setDoneButtonState({ disabled: false, loading: false })

    })
  }

  return (
    <Modal
      centered={false}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button><Icon name="upload" />Import Mailbox</Button>}
    >
      <Modal.Header>Import Mailbox</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Grid>
            <Grid.Row columns={2}>

              <Grid.Column>
                <Grid>
                  <Grid.Row>
                    <Grid.Column>

                      <Form>
                        <Form.Field>
                          <label>Select an mbox to import</label>
                          <input type="file" onChange={onFileSelected} />
                        </Form.Field>
                      </Form>
                    </Grid.Column>

                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <Message info >
                        <Icon name="info circle" />
                        {/* A mailbox in the mbox format is a collection of messages that can be used to transfer messages between mail applications. */}
                        A mailbox can be exported in the mbox format to transfer between mail applications.
                      </Message>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>

              </Grid.Column>
              <Grid.Column>
                {selectedMbox.isValid ?
                  <Segment>
                    <Header as="h4" style={{ margin: ".5em" }}>Name: {file.name}</Header>
                    <Header as="h4" style={{ margin: ".5em" }}>Size: {file.size && filesize(file.size)}</Header>
                    <Header as="h4" style={{ margin: ".5em" }}>Messages: {messagesTemp.length}</Header>
                    <Form onSubmit={importClicked}>
                      <Button type='submit'>Import</Button>
                    </Form>
                  </Segment>
                  :
                  <Header size="large" inverted color="grey" style={{ paddingTop: '1.25em' }} textAlign="center">
                    {selectedMbox.msg}
                  </Header>
                }

              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Cancel"
          labelPosition='right'
          icon='undo'
          onClick={() => setOpen(false)}
        />
        <Button
          content="Done"
          labelPosition='right'
          icon='checkmark'
          onClick={() => setOpen(false)}
          positive
          disabled={doneButtonState.disabled}
          loading={doneButtonState.loading}
        />
      </Modal.Actions>
    </Modal>
  )
}
