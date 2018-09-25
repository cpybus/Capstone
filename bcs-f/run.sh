#!/bin/bash
PID="$(ps -ef | grep run.sh | grep -v grep | awk '{print $2}')"

cd server/
nohup redis-server >/dev/null 2>&1 &
nohup python data/publisher.py >/dev/null 2>&1 &
nohup python data/broker.py >/dev/null 2>&1 &
nohup celery -A server worker -l info >/dev/null 2>&1 &
nohup celery -A server beat -l info >/dev/null 2>&1 &
cd ../gui/
nohup python manage.py runserver 0.0.0.0:8000 >/dev/null 2>&1 &
echo "System is running."
echo "Press Ctrl-c to quit."

trap kill_children INT

function kill_children() {
    echo -e "\nShutting down."
    kill -TERM -- -${PID}
}

wait
