import logging
from time import sleep
from zeroless import (Server, Client, log)

# Setup console logging
consoleHandler = logging.StreamHandler()
log.setLevel(logging.DEBUG)
log.addHandler(consoleHandler)


subscribe_server = Server(port=12346).pub(topic=b'BCS-F', embed_topic=True)


while True:
	# Connects the client to as many servers as desired
	publish_client = Client()
	publish_client.connect_local(port=12345)
	listen_for_pub = publish_client.sub()

	for topic, msg in listen_for_pub:
	    print(topic, ' - ', msg)
	    subscribe_server(msg)


# # Initiate a pair client
# # And assigns a callable and an iterable
# # To both transmit and wait for incoming messages
# pair, listen_for_pair = client.pair()

# subscribe_send, subscribe_listener = Server(port=12347).pair()

# for msg in subscribe_listener:
#     print("Received msg from client: %s" % msg)
#     # pair(msg)






# # import logging

# # from time import sleep

# # from zeroless import (Server, log)

# # # Setup console logging
# # consoleHandler = logging.StreamHandler()
# # log.setLevel(logging.DEBUG)
# # log.addHandler(consoleHandler)

# # Binds the publisher server to port 12345
# # And assigns a callable to publish messages with the topic 'sh'
# pub = Server(port=12345).pub(topic=b'sh', embed_topic=True)

# # Gives publisher some time to get initial subscriptions
# sleep(1)

# for msg in [b"Msg1", b"Msg2", b"Msg3"]:
#     pub(msg)