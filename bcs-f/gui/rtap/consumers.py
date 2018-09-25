from channels import Group
import json

def ws_connect(message):
    Group('clients').add(message.reply_channel)
    Group('clients').send({
        'text': json.dumps({
            'connected': True,
        })
    })

def ws_disconnect(message):
    Group('clients').discard(message.reply_channel)
