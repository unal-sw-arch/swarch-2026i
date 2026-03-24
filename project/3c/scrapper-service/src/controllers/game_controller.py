from flask import Blueprint, jsonify, request
import logging
from services.game_service import GameService

logger = logging.getLogger(__name__)
game_bp = Blueprint('game', __name__, url_prefix='/api/v1/games')
game_service = GameService()

@game_bp.route("/", methods=["GET"])
def index():
    return """
    <h2>Game Price Scraper API</h2>
    <p>Layered Architecture v1.0</p>
    <p>Use /health or /api/v1/games/search endpoints.</p>
    """, 200

@game_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint for the API Gateway."""
    return jsonify({"status": "healthy", "service": "game-scraper"}), 200

@game_bp.route("/search", methods=["GET"])
def search_game():
    """Search for a game across all stores."""
    game_name = request.args.get("name")
    if not game_name:
        return jsonify({"error": "Missing required parameter: name"}), 400

    logger.info(f"Searching for '{game_name}' across all stores...")
    results = game_service.search_all_stores(game_name)

    if not results:
        return jsonify({
            "game": game_name,
            "message": "Game not found on any store",
            "results": [],
        }), 404

    return jsonify({
        "game": game_name,
        "results": results,
    }), 200

@game_bp.route("/compare", methods=["GET"])
def compare_game():
    """Compare prices for a game across all stores."""
    game_name = request.args.get("name")
    if not game_name:
        return jsonify({"error": "Missing required parameter: name"}), 400

    logger.info(f"Comparing prices for '{game_name}'...")
    comparison = game_service.compare_game_prices(game_name)

    if not comparison or not comparison.get("prices"):
        return jsonify({
            "game": game_name,
            "message": "Game not found on any store",
            "prices": [],
            "cheapest": None,
        }), 404

    return jsonify({
        "game": comparison["game"],
        "prices": comparison["prices"],
        "cheapest": comparison.get("cheapest"),
    }), 200

@game_bp.route("/compare/bulk", methods=["POST"])
def compare_bulk():
    """Compare prices for multiple games across all stores."""
    data = request.get_json()
    if not data or "games" not in data:
        return jsonify({
            "error": "Missing required field: games (list of game names)"
        }), 400

    game_names = data["games"]
    if not isinstance(game_names, list) or len(game_names) == 0:
        return jsonify({
            "error": "games must be a non-empty list of strings"
        }), 400

    logger.info(f"Bulk comparing {len(game_names)} games...")
    results = game_service.bulk_compare(game_names)

    response = []
    for r in results:
        response.append({
            "game": r["game"],
            "prices": r.get("prices", []),
            "cheapest": r.get("cheapest"),
        })

    return jsonify({"comparisons": response}), 200

@game_bp.route("/search/<store>", methods=["GET"])
def search_store(store):
    """Search for a game on a specific store."""
    game_name = request.args.get("name")
    if not game_name:
        return jsonify({"error": "Missing required parameter: name"}), 400

    try:
        result = game_service.search_specific_store(store, game_name)
        if result and result.get("price_cents", 0) > 0:
            return jsonify(result), 200
        return jsonify({
            "store": store,
            "game": game_name,
            "message": "Game not found on this store",
        }), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error searching {store}: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@game_bp.route("/trending/<store>", methods=["GET"])
def trending_games(store):
    """Get trending/featured games from a specific store."""
    try:
        games = game_service.get_trending_games(store)
        return jsonify({
            "store": store,
            "count": len(games),
            "games": games,
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error fetching trending from {store}: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
