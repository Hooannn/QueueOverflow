from database import Session, Post
import numpy as np
from flask import (
    jsonify
)
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
import torch

model_name = "bert-base-uncased"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertModel.from_pretrained(model_name)


def get_related_posts(post_id: str):
    try:
        with Session() as session:
            post = session.query(Post).get(post_id)
            if not post:
                return jsonify({"message": "Post not found"}), 404
            
            post = {
                "title": post.title,
                "id": post.id
            }

            posts = session.query(Post).filter_by(publish=True).all()
            posts = [{"id": post.id, "title": post.title} for post in posts]
            
            target_tokens = tokenizer(post["title"], return_tensors="pt")

            with torch.no_grad():
                target_embeddings = model(**target_tokens).last_hidden_state.mean(dim=1).numpy()
            
            similarity_scores = []
            for post in posts:
                post_tokens = tokenizer(post["title"], return_tensors="pt")
                with torch.no_grad():
                    post_embeddings = model(**post_tokens).last_hidden_state.mean(dim=1).numpy()
                similarity_score = cosine_similarity(target_embeddings, post_embeddings)[0][0]
                similarity_scores.append({"id": post["id"], "score": similarity_score})

            sorted_posts = sorted(similarity_scores, key=lambda x: x["score"], reverse=True)
            sorted_posts = list(filter(lambda x: str(x["id"]) != post_id, sorted_posts)) 

            if len(sorted_posts) >= 5:
                top_similar_posts = sorted_posts[:5]
            else:
                top_similar_posts = sorted_posts
            
            mapped_top_similar_posts = [
            {
                "id": str(post["id"]),
                "score": float(post["score"])
            }
            for post in top_similar_posts
            ]
            return jsonify(mapped_top_similar_posts)

    except Exception as e:
        session.rollback()
        error_message = {'error': 'Exception', 'message': str(e)}
        print(error_message, flush=True)
        return jsonify(error_message), 404