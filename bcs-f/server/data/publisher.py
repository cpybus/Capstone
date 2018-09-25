from multiprocessing.managers import BaseManager
from zeroless import Server

# Singleton class which establishes a connection for
# publishing data to the subscribers
class Publisher():

    def __init__(self):
        # self._pub = Server(port=12345).pub(topic=b'BCS-F', embed_topic=True)
        self._pub = Server(port=12345).pub(topic=b'BCS-F', embed_topic=True)

    def send(self, message):
        self._pub(message)

# create the singleton instance and thread manager
publisher = Publisher()
class PublisherManager(BaseManager): pass
PublisherManager.register('get_publisher', callable=lambda: publisher)

# start serving the singleton instance to the modules that need it
manager = PublisherManager(address=('127.0.0.1', 50000), authkey=b'mitre')
server = manager.get_server()
server.serve_forever()
