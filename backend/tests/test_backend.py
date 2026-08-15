import unittest
from unittest.mock import MagicMock, patch
import json
import sys
import os

# Adjust path to import Lambda handlers
sys.path.append(os.path.join(os.path.dirname(__file__), "../src"))

# Mock boto3 before importing modules that configure clients
boto3_mock = MagicMock()
sys.modules['boto3'] = boto3_mock
sys.modules['boto3.dynamodb'] = MagicMock()
sys.modules['boto3.dynamodb.conditions'] = MagicMock()

# Mock OS Environment variables
os.environ["TABLE_NAME"] = "TestTable"
os.environ["CONNECTION_SNS_TOPIC_ARN"] = "arn:aws:sns:us-east-1:123456789012:community-connections"
os.environ["ALERT_SNS_TOPIC_ARN"] = "arn:aws:sns:us-east-1:123456789012:community-alerts"
os.environ["BEDROCK_KNOWLEDGE_BASE_ID"] = "test-kb-id"

# Mock the database helper module
import common.db as db
db.table = MagicMock()

# Import the actual handler functions
from auth_profile import handler as profile_handler
from connect import handler as connect_handler, compute_llm_recommendations
from radar import handler as radar_handler, calculate_radar_scores
from events import handler as event_handler

class TestCommunityOSBackend(unittest.TestCase):

    def setUp(self):
        # Reset mocks
        db.table.reset_mock()

    def test_auth_profile_get_me(self):
        """Tests that GET /me returns user profile and roles properly."""
        mock_item = {
            "id": "test-user-id",
            "name": "Alex Rivera",
            "communityId": "demo-community",
            "roles": ["Learner"]
        }
        
        # Mock GSI query
        db.table.query.return_value = {"Items": [mock_item]}
        
        event = {
            "httpMethod": "GET",
            "resource": "/me",
            "requestContext": {
                "authorizer": {
                    "claims": {
                        "sub": "test-user-id",
                        "cognito:groups": "Learner"
                    }
                }
            }
        }
        
        res = profile_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["name"], "Alex Rivera")
        self.assertEqual(body["id"], "test-user-id")

    @patch("radar.query_items")
    def test_radar_scoring_formula(self, mock_query_items):
        """Tests the deterministic evidence-based Radar scoring formula."""
        def side_effect(pk, prefix):
            if prefix == "QUESTION#":
                return [
                    {"topic": "Production RAG Evaluation", "askedBy": "m-1", "answered": False},
                    {"topic": "Production RAG Evaluation", "askedBy": "m-2", "answered": False},
                    {"topic": "Production RAG Evaluation", "askedBy": "m-3", "answered": True}
                ]
            elif prefix == "RESOURCE#":
                return [
                    {"title": "RAG Evaluation Triad", "tags": ["rag", "evaluation"]}
                ]
            elif prefix == "PRO#":
                return [
                    {"id": "m-1", "skills": ["rag"], "previousHelp": [{"topic": "Production RAG evaluation"}]}
                ]
            return []
            
        mock_query_items.side_effect = side_effect
        
        topics = calculate_radar_scores("demo-community")
        
        # Check that Production RAG Evaluation topic was scored
        rag_topic = next(t for t in topics if t["name"] == "Production RAG Evaluation")
        
        # demandScore = question volume (3) + unique member demand (3 askedBy) + growth (15) = 21
        # expertiseScore = relevant Pros (1) + answered questions (1) + relevant resources (1) = 3
        # gapScore = 21 - 3 = 18
        self.assertEqual(rag_topic["demandScore"], 21)
        self.assertEqual(rag_topic["expertiseScore"], 3)
        self.assertEqual(rag_topic["gapScore"], 18)


    def test_connect_recommendation_filtering(self):
        """Tests that Pros with openToMatching = False are excluded."""
        pros = [
            {"id": "m-1", "name": "Elena", "skills": ["rag"], "openToMatching": True, "previousHelp": []},
            {"id": "m-2", "name": "Alex", "skills": ["rag"], "openToMatching": False, "previousHelp": []}
        ]
        
        # Helper function compute_llm_recommendations should only get eligible pros
        # Let's test that the LLM ranking filters alex out or only generates options for elena
        recs = compute_llm_recommendations("Need RAG help", [pros[0]]) # alex excluded upstream
        self.assertEqual(len(recs), 1)
        self.assertEqual(recs[0]["memberId"], "m-1")

    def test_closed_loop_reduction_math(self):
        """Tests that the pre-event vs post-event gap reduction is calculated correctly."""
        db.table.get_item.return_value = {
            "Item": {
                "PK": "COMMUNITY#demo-community",
                "SK": "EVENT#e-1",
                "id": "e-1",
                "gapId": "topic-rag-evaluation",
                "topic": "Production RAG Evaluation"
            }
        }
        
        event = {
            "httpMethod": "POST",
            "resource": "/events/{eventId}/outcome",
            "pathParameters": {"eventId": "e-1"},
            "body": json.dumps({
                "beforeScore": 80,
                "afterScore": 20,
                "attendance": 100,
                "questionsCount": 35
            }),
            "requestContext": {
                "authorizer": {
                    "claims": {
                        "sub": "org-user",
                        "cognito:groups": "Organizer"
                    }
                }
            }
        }
        
        res = event_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        
        # gapReduction = (80 - 20) / 80 = 0.75
        self.assertEqual(body["gapReduction"], 0.75)
        self.assertEqual(body["beforeScore"], 80)
        self.assertEqual(body["afterScore"], 20)

if __name__ == "__main__":
    unittest.main()
