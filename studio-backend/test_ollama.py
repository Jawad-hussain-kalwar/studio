#!/usr/bin/env python
"""
Quick test script to debug ollama integration issues.
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studio_backend.settings')
django.setup()

from chat_models.ollama_client import OllamaClient

def test_ollama_client():
    print("Testing Ollama client...")
    
    try:
        # Create client
        client = OllamaClient()
        print("✅ Client created successfully")
        
        # Test health check
        is_healthy = client.health_check()
        print(f"✅ Health check: {is_healthy}")
        
        # Test models
        models = client.get_available_models()
        print(f"✅ Models: {len(models)} available")
        for model in models[:3]:  # Show first 3
            print(f"  - {model['name']}")
        
        # Test chat completion
        test_messages = [{"role": "user", "content": "Hello"}]
        print("\n🧪 Testing chat completion...")
        response = client.chat_completion(
            model="smollm2:latest",
            messages=test_messages
        )
        print(f"✅ Chat completion successful: {response}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ollama_client() 