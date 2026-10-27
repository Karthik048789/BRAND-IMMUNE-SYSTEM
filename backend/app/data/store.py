from typing import List, Dict, Any
from backend.app.data.seed_data import get_initial_submissions, populate_seed_memory

class GlobalStore:
    def __init__(self):
        self.submissions: List[Dict[str, Any]] = []
        self.human_decisions: List[Dict[str, Any]] = []
        self._initialized: bool = False

    def initialize(self):
        if not self._initialized:
            populate_seed_memory()
            self.submissions = get_initial_submissions()
            self._initialized = True

    def reset(self):
        populate_seed_memory()
        self.submissions = get_initial_submissions()
        self.human_decisions.clear()

global_store = GlobalStore()
global_store.initialize()
