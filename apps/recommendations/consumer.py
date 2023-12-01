import os
import threading
import json
import pika

url = os.environ.get('RABBITMQ_URL')
def on_message(ch, method, properties, body):
    js = json.loads(body)
    print(f" [x] Received {js}", flush=True)


def connect_and_consume():
    connection = pika.BlockingConnection(pika.URLParameters(url))
    channel = connection.channel()
    channel.queue_declare(queue='recommendations_queue')
    channel.basic_consume(queue='recommendations_queue', on_message_callback=on_message, auto_ack=True)

    try:
        channel.start_consuming()
    except Exception as e:
        print(f" [x] Exception when consuming {e}", flush=True)
        channel.stop_consuming()


def start():
    thread = threading.Thread(target=connect_and_consume)
    thread.start()
    thread.join(0)