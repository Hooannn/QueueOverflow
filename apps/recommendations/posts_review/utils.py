from profanity_check import predict
from bs4 import BeautifulSoup
import re

def is_nsfw(text: str):
    prediction = predict([text])
    return bool(prediction[0])


def parse_html(content: str):
    try:
        html_content = f"""
        ... {content}
        """

        soup = BeautifulSoup(html_content, 'html.parser')
        
        plain_text = soup.get_text(separator=' ', strip=True)
        plain_text = re.sub('\s+', ' ', plain_text).strip()
        plain_text = plain_text.replace("...", "")

        return plain_text, True
    except Exception as e:
        return str(e), False