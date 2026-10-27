import asyncio
from typing import Dict, Any, List, Optional
from backend.app.agents.tone_agent import ToneAgent
from backend.app.agents.factual_agent import FactualAgent
from backend.app.agents.visual_agent import VisualLogoAgent
from backend.app.agents.compliance_agent import ComplianceAgent
from backend.app.models.schemas import AgentResult, AgentType

class AgentOrchestrator:
    def __init__(self):
        self.tone_agent = ToneAgent()
        self.factual_agent = FactualAgent()
        self.visual_agent = VisualLogoAgent()
        self.compliance_agent = ComplianceAgent()

    async def scan_content(
        self,
        content: str,
        content_type: str,
        metadata: Optional[Dict[str, Any]] = None,
        rule_weights: Optional[Dict[str, float]] = None,
        dynamic_rules: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, AgentResult]:
        """
        Runs all 4 antibody agents in parallel using asyncio.gather.
        """
        tone_task = self.tone_agent.scan(content, content_type, metadata, rule_weights, dynamic_rules)
        factual_task = self.factual_agent.scan(content, content_type, metadata, rule_weights, dynamic_rules)
        visual_task = self.visual_agent.scan(content, content_type, metadata, rule_weights, dynamic_rules)
        compliance_task = self.compliance_agent.scan(content, content_type, metadata, rule_weights, dynamic_rules)

        results = await asyncio.gather(
            tone_task,
            factual_task,
            visual_task,
            compliance_task,
            return_exceptions=False
        )

        return {
            AgentType.TONE.value: results[0],
            AgentType.FACTUAL.value: results[1],
            AgentType.VISUAL.value: results[2],
            AgentType.COMPLIANCE.value: results[3],
        }

orchestrator = AgentOrchestrator()
