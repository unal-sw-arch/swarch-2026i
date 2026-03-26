import logging
import yaml
from flask import Flask
from flask import send_from_directory
from controllers.game_controller import game_bp
from flasgger import Swagger


swagger_template = None
with open("swagger.yaml", "r") as file:
    swagger_template = yaml.safe_load(file)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_app():
    """Application factory for the Scrapper Service."""
    app = Flask(__name__)
    app.register_blueprint(game_bp)
    
    app.config['SWAGGER'] = {
        'openapi': '3.0.3'
    }
    
    
    Swagger(app, template=swagger_template)

    @app.route('/swagger.yaml')
    def swagger_spec():
        return send_from_directory('.', 'swagger.yaml')

    @app.route('/test')
    def test():
        return "Flask is running", 200

    logger.info("Scrapper Service initialized with Layered Architecture")
    return app

if __name__ == "__main__":
    app = create_app()
    print("\n=== Registered Routes ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule}")
    print("========================\n")
    app.run(host="0.0.0.0", port=5000, debug=True)

