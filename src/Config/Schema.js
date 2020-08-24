// rxdb expects a document to match the schema
// https://github.com/pubkey/rxdb/issues/439
// you can have optional fields, but not unknown fields

export const messageSchema = {
  'title': 'message schema',
  'description': 'describes a single email message',
  'version': 0,
  'type': 'object',
  'properties': {
    "headers": {
      "type": "object"
    },
    'headerLines': {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string"
          },
          "line": {
            "type": "string"
          }
        }
      }
    },
    "subject": {
      "type": "string"
    },
    // from, to, cc, bcc, replyTo are all Address objects
    "from": {
      "type": "object",
      "properties": {
        "html": {
          "type": "string"
        },
        "text": {
          "type": "string"
        },
        "value": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "to": {
      "type": "object",
      "properties": {
        "html": {
          "type": "string"
        },
        "text": {
          "type": "string"
        },
        "value": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "cc": {
      "type": "object",
      "properties": {
        "html": {
          "type": "string"
        },
        "text": {
          "type": "string"
        },
        "value": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "bcc": {
      "type": "object",
      "properties": {
        "html": {
          "type": "string"
        },
        "text": {
          "type": "string"
        },
        "value": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "date": {
      "type": "number"
    },
    'messageId': {
      'type': 'string',
      'primary': true,
      "final": true
    },
    "inReplyTo": {
      "type": "string"
    },
    "replyTo": {
      "type": "object",
      "properties": {
        "html": {
          "type": "string"
        },
        "text": {
          "type": "string"
        },
        "value": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "references": {
      "type": "array"
    },
    "html": {
      "type": "string"
    },
    "text": {
      "type": "string"
    },
    "textAsHtml": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    },
    "spamScanner": {
      "type": "object",
      "properties": {
        "spamScore": {
          "type": "number"
        },
        "spamWords": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "count": {
                "type": "number"
              },
              "reduced": {
                "type": "string"
              },
              "terms": {
                "type": "array",
                "items": {
                  "type": "object"
                }
              },
              "text": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "hasBeenRead": {
      "type": "boolean",
      "default": false
    }
  },
  'required': [],
  indexes: ['date']
};

export const spamWordsSchema = {
  title: 'spam words schema',
  description: 'words that describe a spam message',
  version: 0,
  type: 'object',
  properties: {
    value: {
      type: 'string',
      primary: true
    },
    weight: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      default: 50
    }
  },
  required: ['value', 'weight'],
  indexes: ['value', 'weight']
};

//  messageSchema;
// export default spamWordsSchema;