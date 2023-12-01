from flask import (
    Blueprint
)
from . import service
bp = Blueprint('post', __name__, url_prefix='/posts')


@bp.get("/<string:id>/related")
def get_related_posts(id):
    return service.get_related_posts(id)
