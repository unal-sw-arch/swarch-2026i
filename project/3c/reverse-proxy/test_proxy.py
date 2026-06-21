import os
import unittest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

# Set environment variables for testing
os.environ["GATEWAY_URL"] = "http://mock-gateway"
os.environ["FRONTEND_URL"] = "http://mock-frontend"

from proxy import app

class TestReverseProxy(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch("httpx.AsyncClient.request")
    def test_gateway_routing(self, mock_request):
        # Configure mock response
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.headers = {"Content-Type": "application/json"}
        async def mock_aiter():
            yield b'{"status": "ok"}'
        mock_response.aiter_bytes = mock_aiter
        mock_request.return_value = mock_response

        # Request to /api/games
        response = self.client.get("/api/games")

        # Verify it routed to mock-gateway
        mock_request.assert_called_once()
        called_args, called_kwargs = mock_request.call_args
        self.assertEqual(called_kwargs["url"], "http://mock-gateway/api/games")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    @patch("httpx.AsyncClient.request")
    def test_frontend_routing(self, mock_request):
        # Configure mock response
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.headers = {"Content-Type": "text/html"}
        async def mock_aiter():
            yield b"<html>Home</html>"
        mock_response.aiter_bytes = mock_aiter
        mock_request.return_value = mock_response

        # Request to /
        response = self.client.get("/")

        # Verify it routed to mock-frontend
        mock_request.assert_called_once()
        called_args, called_kwargs = mock_request.call_args
        self.assertEqual(called_kwargs["url"], "http://mock-frontend/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text, "<html>Home</html>")

    @patch("httpx.AsyncClient.request")
    def test_headers_processing(self, mock_request):
        # Configure mock response
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.headers = {"Content-Type": "application/json", "Connection": "keep-alive"}
        async def mock_aiter():
            yield b"{}"
        mock_response.aiter_bytes = mock_aiter
        mock_request.return_value = mock_response

        # Request with host header
        headers = {"Host": "localhost:8080", "X-Custom-Header": "value"}
        self.client.get("/api/games", headers=headers)

        called_args, called_kwargs = mock_request.call_args
        sent_headers = called_kwargs["headers"]

        # Host header should be stripped
        self.assertNotIn("host", sent_headers)
        # Custom headers should be forwarded
        self.assertEqual(sent_headers.get("x-custom-header"), "value")
        # X-Forwarded headers should be appended
        self.assertIn("x-forwarded-for", sent_headers)
        self.assertIn("x-forwarded-proto", sent_headers)

    @patch("httpx.AsyncClient.request")
    def test_unreachable_backend(self, mock_request):
        import httpx
        # Simulate connection error
        mock_request.side_effect = httpx.ConnectError("Connection refused")

        response = self.client.get("/api/games")

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["detail"], "gateway-service unreachable")

if __name__ == "__main__":
    unittest.main()
