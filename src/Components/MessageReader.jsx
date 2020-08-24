import React, { useState } from 'react'
import {
  Grid
  , Header
} from 'semantic-ui-react'
import SpamScoreModal from './SpamScoreModal'
import ErrorBoundary from './ErrorBoundary'

var dateFormat = require('dateformat');

export default function MessageReader({ selectedMessage }) {
  const [spamScoreThreshold, setSpamScoreThreshold] = useState(5)

  const headerStyle = {
    paddingTop: ".5rem",
    paddingBottom: ".5rem"
  }
  const addressStyle = {
    margin: ".5em 0"
  }
  const dateStyle = {
    margin: ".5em 0"
  }
  const subjectStyle = {
    margin: ".5em 0"
  }

  const dateDisplay = dateFormat(new Date(selectedMessage.date), 'dddd, mmmm dS, yyyy "at" h:MM:ss TT')

  return (
    <Grid className="reader">
      <Grid.Row className="header" style={headerStyle}>
        <Grid.Column>
          <Grid>
            <Grid.Row>
              <Grid.Column width={10}>
                <Header size="tiny" style={addressStyle} content={`${selectedMessage.from && selectedMessage.from.text}`} />

              </Grid.Column>
              <Grid.Column width={6} textAlign="right">

                <Header size="tiny" style={dateStyle} content={dateDisplay} />
              </Grid.Column>

            </Grid.Row>
          </Grid>
          {/* .toLowerCase() ? or build display from array */}
          <Header size="tiny" style={addressStyle} content={`To: ${selectedMessage.to && selectedMessage.to.text}`} />
          {selectedMessage.replyTo && <Header size="tiny" style={addressStyle} content={`Reply-To: ${selectedMessage.replyTo && selectedMessage.replyTo.text}`} />}
          <Header size="medium" style={subjectStyle} content={selectedMessage.subject && selectedMessage.subject} />
        </Grid.Column>
      </Grid.Row>

      {/* At first the idea was to only show the spam score if the message was spam, but I think
        giving an option to show the score for any message provides a better experience. */}
      {/* {(selectedMessage.spamScanner.spamScore >= spamScoreThreshold) ?
            <SpamScoreModal message={selectedMessage} />
             :
            <SpamScoreModal message={selectedMessage} />
          }*/}
      <SpamScoreModal message={selectedMessage} />

      <Grid.Row style={{ paddingTop: 0 }}>
        <Grid.Column className="reader-body">
          <ErrorBoundary>
            <iframe
              sandbox=""
              key={selectedMessage.messageId}
              title="Reader Body"
              width="100%"
              height="100%"
              srcDoc={selectedMessage.html === "" ? selectedMessage.textAsHtml : selectedMessage.html}
            />
          </ErrorBoundary>

        </Grid.Column>
      </Grid.Row>
    </Grid>

  )
}
