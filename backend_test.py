#!/usr/bin/env python3
"""
Comprehensive Backend API Testing Suite for Habit Tracker
Tests all authentication, habit management, completion, and statistics endpoints
"""

import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE_URL}")

class HabitTrackerAPITest:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_habits = []
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name, success, message=""):
        """Log test results"""
        if success:
            self.test_results['passed'] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED - {message}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{API_BASE_URL}{endpoint}"
        try:
            if headers is None:
                headers = {}
            
            if self.auth_token:
                headers['Authorization'] = f"Bearer {self.auth_token}"
            
            response = self.session.request(method, url, json=data, headers=headers)
            return response
        except Exception as e:
            print(f"Request error: {e}")
            return None
    
    def test_user_registration(self):
        """Test user registration with valid data"""
        print("\n=== Testing User Registration ===")
        
        # Test valid registration
        user_data = {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@example.com",
            "password": "SecurePass123!"
        }
        
        response = self.make_request('POST', '/auth/register', user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'email' in data and data['email'] == user_data['email']:
                self.user_id = data['id']
                self.log_result("User Registration", True, f"User created with ID: {self.user_id}")
            else:
                self.log_result("User Registration", False, "Invalid response format")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("User Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Test duplicate email registration
        response = self.make_request('POST', '/auth/register', user_data)
        if response and response.status_code == 400:
            self.log_result("Duplicate Email Prevention", True, "Correctly rejected duplicate email")
        else:
            self.log_result("Duplicate Email Prevention", False, "Should reject duplicate email")
    
    def test_user_login(self):
        """Test user login functionality"""
        print("\n=== Testing User Login ===")
        
        # Test valid login
        login_data = {
            "email": "sarah.johnson@example.com",
            "password": "SecurePass123!"
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and 'token_type' in data:
                self.auth_token = data['access_token']
                self.log_result("Valid Login", True, "Token received successfully")
            else:
                self.log_result("Valid Login", False, "Invalid token response")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Valid Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Test invalid login
        invalid_login = {
            "email": "sarah.johnson@example.com",
            "password": "WrongPassword"
        }
        
        response = self.make_request('POST', '/auth/login', invalid_login)
        if response and response.status_code == 401:
            self.log_result("Invalid Login Rejection", True, "Correctly rejected invalid credentials")
        else:
            self.log_result("Invalid Login Rejection", False, "Should reject invalid credentials")
    
    def test_protected_endpoints(self):
        """Test protected endpoints without authentication"""
        print("\n=== Testing Protected Endpoints ===")
        
        # Save current token
        temp_token = self.auth_token
        self.auth_token = None
        
        # Test accessing protected endpoint without token
        response = self.make_request('GET', '/auth/me')
        if response and response.status_code == 401:
            self.log_result("Unauthorized Access Prevention", True, "Correctly rejected unauthenticated request")
        else:
            self.log_result("Unauthorized Access Prevention", False, "Should reject unauthenticated requests")
        
        # Restore token
        self.auth_token = temp_token
        
        # Test with valid token
        response = self.make_request('GET', '/auth/me')
        if response and response.status_code == 200:
            data = response.json()
            if 'email' in data and data['email'] == "sarah.johnson@example.com":
                self.log_result("Authenticated Access", True, "Successfully accessed protected endpoint")
            else:
                self.log_result("Authenticated Access", False, "Invalid user data returned")
        else:
            self.log_result("Authenticated Access", False, "Failed to access protected endpoint with valid token")
    
    def test_habit_creation(self):
        """Test creating new habits"""
        print("\n=== Testing Habit Creation ===")
        
        # Test creating valid habit
        habit_data = {
            "name": "Morning Meditation",
            "description": "10 minutes of mindfulness meditation every morning",
            "color": "#10B981",
            "icon": "meditation",
            "target_days": 30
        }
        
        response = self.make_request('POST', '/habits', habit_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['name'] == habit_data['name']:
                self.test_habits.append(data)
                self.log_result("Habit Creation", True, f"Habit created: {data['name']}")
            else:
                self.log_result("Habit Creation", False, "Invalid habit response format")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Creation", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Create another habit for testing
        habit_data2 = {
            "name": "Daily Exercise",
            "description": "30 minutes of physical activity",
            "color": "#EF4444",
            "icon": "fitness",
            "target_days": 21
        }
        
        response = self.make_request('POST', '/habits', habit_data2)
        if response and response.status_code == 200:
            data = response.json()
            self.test_habits.append(data)
            self.log_result("Second Habit Creation", True, f"Second habit created: {data['name']}")
        else:
            self.log_result("Second Habit Creation", False, "Failed to create second habit")
    
    def test_habit_retrieval(self):
        """Test getting all habits for authenticated user"""
        print("\n=== Testing Habit Retrieval ===")
        
        response = self.make_request('GET', '/habits')
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= 2:
                # Check if habits have required fields
                habit = data[0]
                required_fields = ['id', 'name', 'current_streak', 'longest_streak', 'completion_count']
                if all(field in habit for field in required_fields):
                    self.log_result("Habit Retrieval", True, f"Retrieved {len(data)} habits with stats")
                else:
                    self.log_result("Habit Retrieval", False, "Habits missing required fields")
            else:
                self.log_result("Habit Retrieval", False, f"Expected at least 2 habits, got {len(data) if isinstance(data, list) else 'invalid format'}")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Retrieval", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
    
    def test_habit_update(self):
        """Test updating habit details"""
        print("\n=== Testing Habit Update ===")
        
        if not self.test_habits:
            self.log_result("Habit Update", False, "No habits available for testing")
            return
        
        habit_id = self.test_habits[0]['id']
        update_data = {
            "name": "Morning Meditation & Breathing",
            "description": "15 minutes of mindfulness meditation with breathing exercises",
            "target_days": 45
        }
        
        response = self.make_request('PUT', f'/habits/{habit_id}', update_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data['name'] == update_data['name'] and data['target_days'] == update_data['target_days']:
                self.log_result("Habit Update", True, "Habit updated successfully")
            else:
                self.log_result("Habit Update", False, "Habit not updated correctly")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Update", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
    
    def test_habit_completion(self):
        """Test marking habits as completed"""
        print("\n=== Testing Habit Completion ===")
        
        if not self.test_habits:
            self.log_result("Habit Completion", False, "No habits available for testing")
            return
        
        habit_id = self.test_habits[0]['id']
        today = datetime.now().strftime("%Y-%m-%d")
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Test marking habit as completed for today
        completion_data = {"completion_date": today}
        response = self.make_request('POST', f'/habits/{habit_id}/complete', completion_data)
        
        if response and response.status_code == 200:
            self.log_result("Habit Completion Today", True, "Habit marked as completed for today")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Completion Today", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Test marking habit as completed for yesterday
        completion_data = {"completion_date": yesterday}
        response = self.make_request('POST', f'/habits/{habit_id}/complete', completion_data)
        
        if response and response.status_code == 200:
            self.log_result("Habit Completion Yesterday", True, "Habit marked as completed for yesterday")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Completion Yesterday", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Test duplicate completion (should fail)
        response = self.make_request('POST', f'/habits/{habit_id}/complete', {"completion_date": today})
        
        if response and response.status_code == 400:
            self.log_result("Duplicate Completion Prevention", True, "Correctly prevented duplicate completion")
        else:
            self.log_result("Duplicate Completion Prevention", False, "Should prevent duplicate completions")
    
    def test_habit_uncompletion(self):
        """Test unmarking habit completions"""
        print("\n=== Testing Habit Uncompletion ===")
        
        if not self.test_habits:
            self.log_result("Habit Uncompletion", False, "No habits available for testing")
            return
        
        habit_id = self.test_habits[0]['id']
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Test removing completion
        response = self.make_request('DELETE', f'/habits/{habit_id}/complete/{today}')
        
        if response and response.status_code == 200:
            self.log_result("Habit Uncompletion", True, "Habit completion removed successfully")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Uncompletion", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Test removing non-existent completion
        future_date = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
        response = self.make_request('DELETE', f'/habits/{habit_id}/complete/{future_date}')
        
        if response and response.status_code == 404:
            self.log_result("Non-existent Completion Removal", True, "Correctly handled non-existent completion")
        else:
            self.log_result("Non-existent Completion Removal", False, "Should return 404 for non-existent completion")
    
    def test_statistics_overview(self):
        """Test statistics overview endpoint"""
        print("\n=== Testing Statistics Overview ===")
        
        response = self.make_request('GET', '/stats/overview')
        
        if response and response.status_code == 200:
            data = response.json()
            required_fields = [
                'total_habits', 'active_streaks', 'total_current_streak',
                'longest_streak', 'total_completions', 'today_completions',
                'avg_completion_rate', 'this_week_performance'
            ]
            
            if all(field in data for field in required_fields):
                if isinstance(data['this_week_performance'], list) and len(data['this_week_performance']) == 7:
                    self.log_result("Statistics Overview", True, f"Stats: {data['total_habits']} habits, {data['total_completions']} completions")
                else:
                    self.log_result("Statistics Overview", False, "Invalid week performance data")
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log_result("Statistics Overview", False, f"Missing fields: {missing_fields}")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Statistics Overview", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
    
    def test_user_isolation(self):
        """Test that users can only access their own habits"""
        print("\n=== Testing User Data Isolation ===")
        
        # Create a second user
        user2_data = {
            "name": "Mike Chen",
            "email": "mike.chen@example.com",
            "password": "AnotherSecurePass456!"
        }
        
        response = self.make_request('POST', '/auth/register', user2_data)
        if not (response and response.status_code == 200):
            self.log_result("User Isolation Setup", False, "Failed to create second user")
            return
        
        # Login as second user
        login_data = {
            "email": "mike.chen@example.com",
            "password": "AnotherSecurePass456!"
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        if not (response and response.status_code == 200):
            self.log_result("User Isolation Setup", False, "Failed to login as second user")
            return
        
        # Save first user's token and switch to second user
        first_user_token = self.auth_token
        self.auth_token = response.json()['access_token']
        
        # Second user should see no habits
        response = self.make_request('GET', '/habits')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 0:
                self.log_result("User Data Isolation", True, "Second user correctly sees no habits")
            else:
                self.log_result("User Data Isolation", False, f"Second user should see 0 habits, saw {len(data)}")
        else:
            self.log_result("User Data Isolation", False, "Failed to get habits for second user")
        
        # Restore first user's token
        self.auth_token = first_user_token
    
    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid habit ID
        response = self.make_request('GET', '/habits/invalid-habit-id')
        # This endpoint doesn't exist, so it should return 404
        
        # Test creating habit with missing required fields
        invalid_habit = {"description": "Missing name field"}
        response = self.make_request('POST', '/habits', invalid_habit)
        if response and response.status_code == 422:
            self.log_result("Invalid Habit Data Handling", True, "Correctly rejected invalid habit data")
        else:
            self.log_result("Invalid Habit Data Handling", False, "Should reject invalid habit data")
        
        # Test updating non-existent habit
        response = self.make_request('PUT', '/habits/non-existent-id', {"name": "Updated"})
        if response and response.status_code == 404:
            self.log_result("Non-existent Habit Update", True, "Correctly handled non-existent habit update")
        else:
            self.log_result("Non-existent Habit Update", False, "Should return 404 for non-existent habit")
        
        # Test completing non-existent habit
        response = self.make_request('POST', '/habits/non-existent-id/complete', {"completion_date": "2024-01-01"})
        if response and response.status_code == 404:
            self.log_result("Non-existent Habit Completion", True, "Correctly handled non-existent habit completion")
        else:
            self.log_result("Non-existent Habit Completion", False, "Should return 404 for non-existent habit")
    
    def test_habit_deletion(self):
        """Test deleting habits"""
        print("\n=== Testing Habit Deletion ===")
        
        if not self.test_habits:
            self.log_result("Habit Deletion", False, "No habits available for testing")
            return
        
        habit_id = self.test_habits[-1]['id']  # Delete the last habit
        
        response = self.make_request('DELETE', f'/habits/{habit_id}')
        
        if response and response.status_code == 200:
            self.log_result("Habit Deletion", True, "Habit deleted successfully")
            
            # Verify habit is actually deleted
            response = self.make_request('GET', '/habits')
            if response and response.status_code == 200:
                remaining_habits = response.json()
                if not any(h['id'] == habit_id for h in remaining_habits):
                    self.log_result("Habit Deletion Verification", True, "Habit successfully removed from list")
                else:
                    self.log_result("Habit Deletion Verification", False, "Habit still appears in list")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_result("Habit Deletion", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
    
    def run_integration_flow_test(self):
        """Test complete user journey"""
        print("\n=== Testing Complete Integration Flow ===")
        
        # This test uses a fresh user to test the complete flow
        flow_user = {
            "name": "Emma Wilson",
            "email": "emma.wilson@example.com",
            "password": "FlowTest789!"
        }
        
        # 1. Register
        response = self.make_request('POST', '/auth/register', flow_user)
        if not (response and response.status_code == 200):
            self.log_result("Integration Flow - Register", False, "Failed to register flow test user")
            return
        
        # 2. Login
        login_data = {"email": flow_user["email"], "password": flow_user["password"]}
        response = self.make_request('POST', '/auth/login', login_data)
        if not (response and response.status_code == 200):
            self.log_result("Integration Flow - Login", False, "Failed to login flow test user")
            return
        
        # Save current token and use flow user token
        original_token = self.auth_token
        self.auth_token = response.json()['access_token']
        
        # 3. Create habit
        habit_data = {
            "name": "Read Daily",
            "description": "Read for 30 minutes every day",
            "color": "#8B5CF6",
            "icon": "book",
            "target_days": 14
        }
        
        response = self.make_request('POST', '/habits', habit_data)
        if not (response and response.status_code == 200):
            self.log_result("Integration Flow - Create Habit", False, "Failed to create habit")
            self.auth_token = original_token
            return
        
        flow_habit = response.json()
        
        # 4. Mark completions for multiple days
        dates = [
            (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            datetime.now().strftime("%Y-%m-%d")
        ]
        
        for date in dates:
            response = self.make_request('POST', f'/habits/{flow_habit["id"]}/complete', {"completion_date": date})
            if not (response and response.status_code == 200):
                self.log_result("Integration Flow - Mark Completions", False, f"Failed to mark completion for {date}")
                self.auth_token = original_token
                return
        
        # 5. Check stats
        response = self.make_request('GET', '/stats/overview')
        if response and response.status_code == 200:
            stats = response.json()
            if stats['total_habits'] == 1 and stats['total_completions'] == 3:
                self.log_result("Integration Flow - Complete", True, "Full user journey completed successfully")
            else:
                self.log_result("Integration Flow - Stats Check", False, f"Expected 1 habit and 3 completions, got {stats['total_habits']} habits and {stats['total_completions']} completions")
        else:
            self.log_result("Integration Flow - Stats Check", False, "Failed to get stats")
        
        # Restore original token
        self.auth_token = original_token
    
    def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 Starting Comprehensive Backend API Testing")
        print("=" * 60)
        
        try:
            # Authentication Tests
            self.test_user_registration()
            self.test_user_login()
            self.test_protected_endpoints()
            
            # Habit Management Tests
            self.test_habit_creation()
            self.test_habit_retrieval()
            self.test_habit_update()
            
            # Habit Completion Tests
            self.test_habit_completion()
            self.test_habit_uncompletion()
            
            # Statistics Tests
            self.test_statistics_overview()
            
            # Security & Isolation Tests
            self.test_user_isolation()
            
            # Error Handling Tests
            self.test_error_handling()
            
            # Cleanup Tests
            self.test_habit_deletion()
            
            # Integration Flow Test
            self.run_integration_flow_test()
            
        except Exception as e:
            print(f"❌ Test execution error: {e}")
            self.test_results['errors'].append(f"Test execution error: {e}")
        
        # Print final results
        self.print_test_summary()
    
    def print_test_summary(self):
        """Print comprehensive test results"""
        print("\n" + "=" * 60)
        print("🏁 TEST EXECUTION COMPLETE")
        print("=" * 60)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        success_rate = (self.test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 RESULTS SUMMARY:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {self.test_results['passed']}")
        print(f"   ❌ Failed: {self.test_results['failed']}")
        print(f"   📈 Success Rate: {success_rate:.1f}%")
        
        if self.test_results['errors']:
            print(f"\n🔍 FAILED TESTS:")
            for i, error in enumerate(self.test_results['errors'], 1):
                print(f"   {i}. {error}")
        
        print("\n" + "=" * 60)
        
        # Determine overall status
        if self.test_results['failed'] == 0:
            print("🎉 ALL TESTS PASSED - Backend is production ready!")
        elif self.test_results['failed'] <= 2:
            print("⚠️  MOSTLY WORKING - Minor issues detected")
        else:
            print("🚨 CRITICAL ISSUES - Backend needs attention")
        
        return success_rate >= 80  # Return True if 80% or more tests pass


if __name__ == "__main__":
    tester = HabitTrackerAPITest()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if success else 1)