"""gui URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.shortcuts import redirect
import threading
from zeroless import Client
from channels import Group

def redirectIndex(req):
    return redirect("/rtap/1")

urlpatterns = [
    url(r'^rtap/', include('rtap.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^$', redirectIndex),
]

def sendData(data):
    Group('clients').send({
        'text': data
    })

def listenForData():

    client = Client()
    client.connect("127.0.0.1", port=12345)

    listen_for_pub = client.sub(topics=[b'BCS-F'])
    # listen_for_pub = client.sub()


    for msg_data in listen_for_pub:
        # the generator obj from zeroless, in documentation, sends a 2 obj tuple
        # but in practice it sometimes sends  a 3 obj tuple.
        # 2 obj tuple: (topic, msg)
        # 3 obj tuple: (topic, topic, msg)
        msg = msg_data[-1]
        topic = msg_data[0]

        sendData(msg)


t = threading.Thread(target=listenForData)

t.setDaemon(True)
t.start()
