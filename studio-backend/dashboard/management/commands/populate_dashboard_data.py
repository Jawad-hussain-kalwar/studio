"""
Django management command to populate dashboard with realistic mock data.
Usage: python manage.py populate_dashboard_data [--days=30] [--users=5]
"""
import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone

from dashboard.models import RequestLog, UserSession, FeedbackLog, ThreatLog


class Command(BaseCommand):
    help = 'Populate dashboard with realistic mock data for development and testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days', 
            type=int, 
            default=30,
            help='Number of days of data to generate (default: 30)'
        )
        parser.add_argument(
            '--users', 
            type=int, 
            default=5,
            help='Number of users to create data for (default: 5)'
        )
        parser.add_argument(
            '--clear', 
            action='store_true',
            help='Clear existing dashboard data before populating'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        num_users = options['users']
        clear_data = options['clear']
        
        if clear_data:
            self.stdout.write('Clearing existing dashboard data...')
            RequestLog.objects.all().delete()
            UserSession.objects.all().delete()
            FeedbackLog.objects.all().delete()
            ThreatLog.objects.all().delete()
        
        self.stdout.write(f'Generating {days} days of data for {num_users} users...')
        
        # Create or get test users
        self.stdout.write('Step 1: Creating test users...')
        users = self._create_test_users(num_users)
        self.stdout.write(f'✓ Created/found {len(users)} users')
        
        # Generate data for each day
        self.stdout.write('Step 2: Generating daily request data...')
        for day_offset in range(days):
            date = timezone.now() - timedelta(days=day_offset)
            self.stdout.write(f'  Generating data for day {day_offset + 1}/{days} ({date.strftime("%Y-%m-%d")})...')
            self._generate_day_data(date, users)
        
        # Generate some threat logs
        self.stdout.write('Step 3: Generating threat logs...')
        self._generate_threat_logs(days)
        self.stdout.write('✓ Threat logs generated')
        
        # Generate user sessions
        self.stdout.write('Step 4: Generating user sessions...')
        self._generate_user_sessions(users, days)
        self.stdout.write('✓ User sessions generated')
        
        # Generate feedback logs (for some requests)
        self.stdout.write('Step 5: Generating feedback logs...')
        self._generate_feedback_logs()
        self.stdout.write('✓ Feedback logs generated')
        
        # Show summary
        self.stdout.write('Step 6: Showing summary...')
        self._show_summary()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated dashboard with {days} days of mock data!'
            )
        )
    
    def _create_test_users(self, num_users):
        """Create or get test users."""
        users = []
        for i in range(num_users):
            username = f'testuser{i+1}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'first_name': f'Test',
                    'last_name': f'User {i+1}'
                }
            )
            users.append(user)
            if created:
                self.stdout.write(f'Created user: {username}')
        return users
    
    def _generate_day_data(self, date, users):
        """Generate realistic request data for a single day."""
        # Models and their relative popularity
        models = [
            ('llama3.2', 0.35),
            ('gpt-4o-mini', 0.25),
            ('claude-3-haiku', 0.20),
            ('gemini-pro', 0.15),
            ('mistral-7b', 0.05),
        ]
        
        # Endpoints and their frequencies
        endpoints = [
            ('/v1/chat/completions', 0.85),
            ('/api/auth/oauth/google/', 0.05),
            ('/v1/models', 0.10),
        ]
        
        # Country codes and their frequencies
        countries = [
            ('US', 0.35), ('ID', 0.15), ('IN', 0.12), ('GB', 0.08),
            ('CA', 0.07), ('DE', 0.06), ('FR', 0.05), ('JP', 0.04),
            ('BR', 0.04), ('AU', 0.04)
        ]
        
        # Generate 50-200 requests per day with realistic patterns
        num_requests = random.randint(50, 200)
        
        for _ in range(num_requests):
            # Random time during the day (more activity during business hours)
            hour = random.choices(
                range(24), 
                weights=[2, 1, 1, 1, 1, 1, 3, 5, 8, 10, 12, 12, 
                        12, 12, 10, 8, 6, 5, 4, 3, 3, 3, 2, 2]
            )[0]
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            
            request_time = date.replace(
                hour=hour, minute=minute, second=second, microsecond=0
            )
            
            # Choose endpoint
            endpoint = random.choices(
                [e[0] for e in endpoints],
                weights=[e[1] for e in endpoints]
            )[0]
            
            # Choose user (80% authenticated, 20% anonymous)
            user = random.choice(users) if random.random() < 0.8 else None
            
            # Choose model and generate metrics
            if endpoint == '/v1/chat/completions':
                model_name = random.choices(
                    [m[0] for m in models],
                    weights=[m[1] for m in models]
                )[0]
                
                # Token usage (realistic ranges)
                prompt_tokens = random.randint(50, 500)
                completion_tokens = random.randint(20, 300)
                total_tokens = prompt_tokens + completion_tokens
                
                # Cost calculation (rough estimates per 1K tokens)
                cost_per_1k = {
                    'llama3.2': 0.0001,
                    'gpt-4o-mini': 0.0002,
                    'claude-3-haiku': 0.00015,
                    'gemini-pro': 0.0001,
                    'mistral-7b': 0.0001,
                }
                cost_usd = Decimal(str((total_tokens / 1000) * cost_per_1k.get(model_name, 0.0001)))
                
                # Latency (depends on model and tokens)
                base_latency = random.uniform(1000, 3000)  # 1-3 seconds base
                token_latency = total_tokens * random.uniform(5, 15)  # Per token cost
                latency_ms = base_latency + token_latency
                
                finish_reason = random.choices(
                    ['stop', 'length', 'content_filter'],
                    weights=[0.85, 0.10, 0.05]
                )[0]
            else:
                model_name = ''
                prompt_tokens = None
                completion_tokens = None
                total_tokens = None
                cost_usd = None
                latency_ms = random.uniform(100, 800)  # Faster for non-AI endpoints
                finish_reason = ''
            
            # Status code (mostly successful)
            status_code = random.choices(
                [200, 400, 401, 429, 500],
                weights=[0.85, 0.05, 0.03, 0.04, 0.03]
            )[0]
            
            # Geographic data
            country_code = random.choices(
                [c[0] for c in countries],
                weights=[c[1] for c in countries]
            )[0]
            
            # Generate realistic IP addresses
            ip_address = f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}"
            
            # Create request log
            RequestLog.objects.create(
                created_at=request_time,
                endpoint=endpoint,
                method='POST' if endpoint == '/v1/chat/completions' else 'GET',
                status_code=status_code,
                latency_ms=latency_ms,
                model_name=model_name,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                cost_usd=cost_usd,
                country_code=country_code,
                ip_address=ip_address,
                user=user,
                user_agent=self._random_user_agent(),
                finish_reason=finish_reason,
            )
    
    def _generate_threat_logs(self, days):
        """Generate realistic threat logs."""
        threat_types = [
            ('rate_limit', 'medium', 0.4),
            ('suspicious_content', 'high', 0.3),
            ('invalid_auth', 'low', 0.2),
            ('prompt_injection', 'high', 0.1),
        ]
        
        # Generate 2-5 threats per day
        for day_offset in range(days):
            date = timezone.now() - timedelta(days=day_offset)
            num_threats = random.randint(2, 5)
            
            for _ in range(num_threats):
                threat_type, severity, _ = random.choices(
                    threat_types,
                    weights=[t[2] for t in threat_types]
                )[0]
                
                threat_time = date + timedelta(
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
                
                ThreatLog.objects.create(
                    created_at=threat_time,
                    threat_type=threat_type,
                    severity=severity,
                    ip_address=f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
                    user_agent=self._random_user_agent(),
                    country_code=random.choice(['US', 'RU', 'CN', 'BR', 'IN']),
                    description=f"Detected {threat_type} from suspicious IP",
                    resolved=random.random() < 0.7,  # 70% resolved
                )
    
    def _generate_user_sessions(self, users, days):
        """Generate user session data."""
        for user in users:
            # Generate 1-3 sessions per day per user
            for day_offset in range(days):
                date = timezone.now() - timedelta(days=day_offset)
                num_sessions = random.randint(1, 3)
                
                for _ in range(num_sessions):
                    session_start = date + timedelta(
                        hours=random.randint(8, 18),  # Business hours mostly
                        minutes=random.randint(0, 59)
                    )
                    
                    # Session duration: 10 minutes to 2 hours
                    duration_minutes = random.randint(10, 120)
                    session_end = session_start + timedelta(minutes=duration_minutes)
                    
                    # Get requests during this session
                    session_requests = RequestLog.objects.filter(
                        user=user,
                        created_at__gte=session_start,
                        created_at__lte=session_end
                    )
                    
                    total_requests = session_requests.count()
                    total_cost = sum(
                        req.cost_usd for req in session_requests 
                        if req.cost_usd
                    ) or Decimal('0')
                    total_tokens = sum(
                        req.total_tokens for req in session_requests 
                        if req.total_tokens
                    ) or 0
                    
                    UserSession.objects.create(
                        user=user,
                        session_start=session_start,
                        session_end=session_end,
                        total_requests=total_requests,
                        total_cost=total_cost,
                        total_tokens=total_tokens,
                        ip_address=f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
                        user_agent=self._random_user_agent(),
                    )
    
    def _generate_feedback_logs(self):
        """Generate feedback for some requests."""
        # Add feedback to 10% of chat completion requests
        chat_requests = RequestLog.objects.filter(
            endpoint='/v1/chat/completions',
            status_code=200
        )
        
        sample_size = max(1, int(chat_requests.count() * 0.1))
        sample_requests = random.sample(list(chat_requests), sample_size)
        
        feedbacks = [
            (5, "Excellent response, very helpful!"),
            (4, "Good answer, mostly accurate."),
            (3, "Okay response, could be better."),
            (2, "Not very helpful."),
            (1, "Poor response, not relevant."),
        ]
        
        for request_log in sample_requests:
            if request_log.user:  # Only authenticated users can leave feedback
                rating, text = random.choices(
                    feedbacks,
                    weights=[0.3, 0.35, 0.2, 0.1, 0.05]  # Skew towards positive
                )[0]
                
                FeedbackLog.objects.create(
                    request_log=request_log,
                    user=request_log.user,
                    rating=rating,
                    feedback_text=text if random.random() < 0.6 else "",  # 60% have text
                    created_at=request_log.created_at + timedelta(minutes=random.randint(1, 60))
                )
    
    def _random_user_agent(self):
        """Generate random but realistic user agent strings."""
        agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
            "Mozilla/5.0 (Android 11; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0",
        ]
        return random.choice(agents)
    
    def _show_summary(self):
        """Show summary of generated data."""
        summary = {
            'Request Logs': RequestLog.objects.count(),
            'User Sessions': UserSession.objects.count(),
            'Feedback Logs': FeedbackLog.objects.count(),
            'Threat Logs': ThreatLog.objects.count(),
        }
        
        self.stdout.write('\nGenerated Data Summary:')
        for model_name, count in summary.items():
            self.stdout.write(f'  {model_name}: {count} records') 