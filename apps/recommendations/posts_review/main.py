import os
import threading
import json
import pika
from . import utils
url = os.environ.get('RABBITMQ_URL')

def on_post_updated(post_data: dict):
    try:
        title = post_data.get("title")
        is_nsfw = utils.is_nsfw(title)
        if is_nsfw:
            notify_updated_post_reviewed_fail(post_data.get('id'), "Sensitive content detected. Please change your title then resubmit again. All the rejected posts will be removed in 7 days.")
            return
        
        content = post_data.get("content")
        plain_text, parsed_success = utils.parse_html(content)

        if not parsed_success:
            notify_updated_post_reviewed_fail(post_data.get('id'), "Something went wrong. Please re-submit again. All the rejected posts will be removed in 7 days.")
            return
        
        is_nsfw = utils.is_nsfw(plain_text)

        if is_nsfw:
            notify_updated_post_reviewed_fail(post_data.get('id'), "Sensitive content detected. Please change your content then resubmit again. All the rejected posts will be removed in 7 days.")
            return
        
        notify_updated_post_reviewed_success(post_data.get('id'), "Ready to publish")

    except Exception as e:
        print(f" Exception handling message {str(e)}", flush=True)


def on_post_created(post_data: dict):
    try:
        title = post_data.get("title")
        is_nsfw = utils.is_nsfw(title)
        if is_nsfw:
            notify_post_reviewed_fail(post_data.get('id'), "Sensitive content detected. Please change your title then resubmit again. All the rejected posts will be removed in 7 days.")
            return
        
        content = post_data.get("content")
        plain_text, parsed_success = utils.parse_html(content)

        if not parsed_success:
            notify_post_reviewed_fail(post_data.get('id'), "Something went wrong. Please re-submit again. All the rejected posts will be removed in 7 days.")
            return
        
        is_nsfw = utils.is_nsfw(plain_text)

        if is_nsfw:
            notify_post_reviewed_fail(post_data.get('id'), "Sensitive content detected. Please change your content then resubmit again. All the rejected posts will be removed in 7 days.")
            return
        
        notify_post_reviewed_success(post_data.get('id'), "Ready to publish")

    except Exception as e:
        print(f" Exception handling message {str(e)}", flush=True)


event_handlers = {
    "post.created": on_post_created,
    "post.updated": on_post_updated
}


def notify_updated_post_reviewed_fail(post_id: str, message: str):
    raw_message = {
        "pattern": "post.updated.reviewed",
        "data": {
            "postId": post_id,
            "message": message,
            "success": False,
        }
    }
    json_message = json.dumps(raw_message)
    publish_message_to_posts_queue(json_message)


def notify_updated_post_reviewed_success(post_id: str, message: str):
    raw_message = {
        "pattern": "post.updated.reviewed",
        "data": {
            "postId": post_id,
            "message": message,
            "success": True,
        }
    }
    json_message = json.dumps(raw_message)
    publish_message_to_posts_queue(json_message)


def notify_post_reviewed_fail(post_id: str, message: str):
    raw_message = {
        "pattern": "post.reviewed",
        "data": {
            "postId": post_id,
            "message": message,
            "success": False,
        }
    }
    json_message = json.dumps(raw_message)
    publish_message_to_posts_queue(json_message)


def notify_post_reviewed_success(post_id: str, message: str):
    raw_message = {
        "pattern": "post.reviewed",
        "data": {
            "postId": post_id,
            "message": message,
            "success": True,
        }
    }
    json_message = json.dumps(raw_message)
    publish_message_to_posts_queue(json_message)


def on_review_message(ch, method, properties, body):
    try:
        js = json.loads(body)
        if not isinstance(js, dict):
            print(f" Not valid data pattern {js}", flush=True)
            return
        
        pattern = js.get('pattern')
        data = js.get('data')

        func_factory = event_handlers.get(pattern)
        
        if func_factory is not None:
            func_factory(data)
        else:
            print(f" No event handler found for pattern {pattern}", flush=True)
    except Exception as e:
        print(f" Exception handling message {str(e)}", flush=True)


def connect_and_consume_review_queue():
    connection = pika.BlockingConnection(pika.URLParameters(url))
    channel = connection.channel()
    channel.queue_declare(queue='review_queue')
    channel.basic_consume(queue='review_queue', on_message_callback=on_review_message, auto_ack=True)

    try:
        channel.start_consuming()
    except Exception as e:
        print(f" [x] Exception when consuming {str(e)}", flush=True)
        channel.stop_consuming()


def start_review_queue_consumer():
    thread = threading.Thread(target=connect_and_consume_review_queue)
    thread.start()
    thread.join(0)


def publish_message_to_posts_queue(message):
    try:
        with pika.BlockingConnection(pika.URLParameters(url)) as connection:
            with connection.channel() as channel:
                channel.queue_declare(queue='posts_queue', durable=False)
                channel.basic_publish(
                    exchange='',
                    routing_key='posts_queue',
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,
                    )
                )

                print(f" Sent '{message}' to the queue 'posts_queue'", flush=True)

    except Exception as e:
        print(f"An error occurred when : {str(e)}", flush=True)