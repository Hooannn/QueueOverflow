from flask import Flask
from dotenv import load_dotenv
from consumer import start as start_consumer
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.get('/')
def index():
    return "ok"

if __name__ == '__main__':
    start_consumer()
    
    from posts import controller as posts_controller
    app.register_blueprint(posts_controller.bp)
    app.run(debug = True, host = '0.0.0.0', port=8000)

    
    

    
    