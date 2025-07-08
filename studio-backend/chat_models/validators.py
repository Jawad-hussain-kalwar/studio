"""
Validation utilities for chat completion requests and responses.
"""
import re
from typing import Dict, List, Any, Optional, Union
from rest_framework import serializers
from django.core.exceptions import ValidationError


class ChatMessageValidator:
    """Validator for individual chat messages."""
    
    ALLOWED_ROLES = {"user", "assistant", "system"}
    MAX_CONTENT_LENGTH = 50000  # Characters
    
    @classmethod
    def validate_message(cls, message: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate and clean a single chat message.
        
        Args:
            message: Message dictionary to validate
            
        Returns:
            Cleaned message with only role and content
            
        Raises:
            ValidationError: If message is invalid
        """
        if not isinstance(message, dict):
            raise ValidationError("Message must be a dictionary")
        
        # Validate role
        role = message.get("role", "").strip().lower()
        if not role:
            raise ValidationError("Message role is required")
        if role not in cls.ALLOWED_ROLES:
            raise ValidationError(f"Role must be one of: {', '.join(cls.ALLOWED_ROLES)}")
        
        # Validate content
        content = message.get("content", "")
        if not isinstance(content, str):
            raise ValidationError("Message content must be a string")
        
        content = content.strip()
        if not content and role == "user":
            raise ValidationError("User message content cannot be empty")
        
        if len(content) > cls.MAX_CONTENT_LENGTH:
            raise ValidationError(f"Message content too long (max {cls.MAX_CONTENT_LENGTH} characters)")
        
        # Check for potential security issues
        cls._validate_content_security(content)
        
        return {
            "role": role,
            "content": content
        }
    
    @classmethod
    def _validate_content_security(cls, content: str) -> None:
        """Basic security validation for message content."""
        # Check for excessive repetition (potential DoS)
        if cls._has_excessive_repetition(content):
            raise ValidationError("Message contains excessive repetition")
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'<script[^>]*>.*?</script>',  # Script tags
            r'javascript:',               # JavaScript URLs
            r'data:text/html',           # Data URLs with HTML
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                raise ValidationError("Message contains potentially unsafe content")
    
    @classmethod
    def _has_excessive_repetition(cls, content: str, max_ratio: float = 0.7) -> bool:
        """Check if content has excessive character repetition."""
        if len(content) < 50:  # Skip check for short content
            return False
        
        char_counts = {}
        for char in content:
            char_counts[char] = char_counts.get(char, 0) + 1
        
        max_count = max(char_counts.values())
        repetition_ratio = max_count / len(content)
        
        return repetition_ratio > max_ratio


class ChatRequestValidator:
    """Validator for complete chat completion requests."""
    
    SUPPORTED_MODELS = {
        # This should match available Ollama models
        "llama2", "llama2:7b", "llama2:13b", "llama2:70b",
        "codellama", "codellama:7b", "codellama:13b", "codellama:34b",
        "mistral", "mistral:7b", "mistral:instruct",
        "neural-chat", "starling-lm", "zephyr",
        # Add more as needed
    }
    
    @classmethod
    def validate_request(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate complete chat completion request.
        
        Args:
            data: Request data to validate
            
        Returns:
            Cleaned and validated request data
            
        Raises:
            ValidationError: If request is invalid
        """
        validated = {}
        
        # Validate model
        model = data.get("model", "").strip()
        if not model:
            raise ValidationError("Model is required")
        
        # For now, accept any model name (Ollama might have custom models)
        # In production, you might want to validate against actual available models
        validated["model"] = model
        
        # Validate messages
        messages = data.get("messages", [])
        if not isinstance(messages, list):
            raise ValidationError("Messages must be a list")
        if not messages:
            raise ValidationError("At least one message is required")
        if len(messages) > 100:  # Reasonable limit
            raise ValidationError("Too many messages (max 100)")
        
        validated_messages = []
        for i, message in enumerate(messages):
            try:
                validated_message = ChatMessageValidator.validate_message(message)
                validated_messages.append(validated_message)
            except ValidationError as e:
                raise ValidationError(f"Message {i + 1}: {e}")
        
        # Ensure conversation has proper structure
        cls._validate_conversation_structure(validated_messages)
        validated["messages"] = validated_messages
        
        # Validate temperature
        temperature = data.get("temperature", 0.7)
        if not isinstance(temperature, (int, float)):
            raise ValidationError("Temperature must be a number")
        if not 0.0 <= temperature <= 2.0:
            raise ValidationError("Temperature must be between 0.0 and 2.0")
        validated["temperature"] = float(temperature)
        
        # Validate top_p
        top_p = data.get("topP", 0.9)  # Note: frontend sends topP (camelCase)
        if not isinstance(top_p, (int, float)):
            raise ValidationError("Top-p must be a number")
        if not 0.0 <= top_p <= 1.0:
            raise ValidationError("Top-p must be between 0.0 and 1.0")
        validated["top_p"] = float(top_p)
        
        # Validate stream
        stream = data.get("stream", False)
        if not isinstance(stream, bool):
            raise ValidationError("Stream must be a boolean")
        validated["stream"] = stream
        
        # Validate tools (optional)
        tools = data.get("tools", [])
        if not isinstance(tools, list):
            raise ValidationError("Tools must be a list")
        validated["tools"] = tools
        
        return validated
    
    @classmethod
    def _validate_conversation_structure(cls, messages: List[Dict[str, str]]) -> None:
        """Validate the structure of the conversation."""
        if not messages:
            return
        
        # Check for proper conversation flow
        roles = [msg["role"] for msg in messages]
        
        # First message should typically be user or system
        if roles[0] not in {"user", "system"}:
            raise ValidationError("Conversation should start with user or system message")
        
        # Check for consecutive assistant messages (might indicate manipulation)
        consecutive_assistant = 0
        for role in roles:
            if role == "assistant":
                consecutive_assistant += 1
                if consecutive_assistant > 2:
                    raise ValidationError("Too many consecutive assistant messages")
            else:
                consecutive_assistant = 0
        
        # Last message should typically be from user (for completion)
        if roles[-1] not in {"user", "system"}:
            raise ValidationError("Conversation should end with user or system message")


class ModelValidator:
    """Validator for model-related requests."""
    
    @classmethod
    def validate_model_name(cls, model_name: str) -> str:
        """Validate and clean model name."""
        if not isinstance(model_name, str):
            raise ValidationError("Model name must be a string")
        
        model_name = model_name.strip()
        if not model_name:
            raise ValidationError("Model name cannot be empty")
        
        # Basic model name format validation
        if not re.match(r'^[a-zA-Z0-9._:-]+$', model_name):
            raise ValidationError("Model name contains invalid characters")
        
        if len(model_name) > 100:
            raise ValidationError("Model name too long")
        
        return model_name


class ResponseFormatter:
    """Utilities for formatting responses to match frontend expectations."""
    
    @staticmethod
    def to_camel_case(snake_str: str) -> str:
        """Convert snake_case to camelCase."""
        components = snake_str.split('_')
        return components[0] + ''.join(word.capitalize() for word in components[1:])
    
    @classmethod
    def format_response_keys(cls, data: Union[Dict, List]) -> Union[Dict, List]:
        """
        Recursively convert dictionary keys from snake_case to camelCase.
        
        Args:
            data: Dictionary or list to convert
            
        Returns:
            Data with camelCase keys
        """
        if isinstance(data, dict):
            return {
                cls.to_camel_case(key): cls.format_response_keys(value)
                for key, value in data.items()
            }
        elif isinstance(data, list):
            return [cls.format_response_keys(item) for item in data]
        else:
            return data 