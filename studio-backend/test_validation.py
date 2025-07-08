#!/usr/bin/env python
"""
Test script to debug request validation issues.
"""
import os
import sys
import django
import json

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studio_backend.settings')
django.setup()

from chat_models.validators import ChatRequestValidator, ResponseFormatter
from django.core.exceptions import ValidationError

def test_validation():
    print("Testing request validation...")
    
    # Test data that matches what curl is sending
    test_data = {
        "model": "smollm2:latest",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": False
    }
    
    try:
        print(f"📝 Input data: {test_data}")
        
        # Test validation
        print("\n🧪 Testing validation...")
        validator = ChatRequestValidator()
        cleaned_data = validator.validate_request(test_data)
        print(f"✅ Validation successful: {cleaned_data}")
        
        # Test response formatting
        print("\n🧪 Testing response formatting...")
        formatter = ResponseFormatter()
        
        # Simulate ollama response
        test_response = {
            "id": "test-123",
            "choices": [{
                "message": {"role": "assistant", "content": "Hello!"},
                "finish_reason": "stop"
            }],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15}
        }
        
        formatted = formatter.format_response_keys(test_response)
        print(f"✅ Formatting successful: {formatted}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_validation() 