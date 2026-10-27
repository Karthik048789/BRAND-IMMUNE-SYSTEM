from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import AgentResult, AgentType, FlaggedSpan

class BaseAgent(ABC):
    def __init__(self, agent_type: AgentType, name: str):
        self.agent_type = agent_type
        self.name = name

    @abstractmethod
    async def scan(self, content: str, content_type: str, metadata: Optional[Dict[str, Any]] = None, rule_weights: Optional[Dict[str, float]] = None, dynamic_rules: Optional[List[Dict[str, Any]]] = None) -> AgentResult:
        """Scan content and return structured AgentResult."""
        pass
