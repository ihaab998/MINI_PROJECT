import sys
import os

# Add root project directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.seed import seed_biomarker_definitions

if __name__ == "__main__":
    seed_biomarker_definitions()
