import React from 'react'

// Components
import ImportMailboxModal from './ImportMailboxModal'
import OptionsModal from './OptionsModal'

function Toolbar({ messages, setMessages, spamWords, setSpamWords }) {

  return (
    <div className="toolbar">
      <ImportMailboxModal />
      <OptionsModal spamWords={spamWords} setSpamWords={setSpamWords} />
    </div>
  );
}

export default Toolbar