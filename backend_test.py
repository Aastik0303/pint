import requests
import sys
from datetime import datetime
import os
import json

class GlowCareAPITester:
    def __init__(self):
        # Use localhost for backend testing due to routing issues with external URL
        self.base_url = "http://localhost:8001"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_product_id = None

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check", True)
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
        return False

    def test_get_categories(self):
        """Test categories endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/categories", timeout=10)
            if response.status_code == 200:
                data = response.json()
                expected_categories = ["Skincare", "Haircare", "Makeup", "Healthcare"]
                if data.get("categories") == expected_categories:
                    self.log_result("Get Categories", True)
                    return True
                else:
                    self.log_result("Get Categories", False, f"Categories mismatch: {data}")
            else:
                self.log_result("Get Categories", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Get Categories", False, f"Exception: {str(e)}")
        return False

    def test_get_products(self):
        """Test get products endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "products" in data and isinstance(data["products"], list):
                    self.log_result("Get Products", True, f"Found {len(data['products'])} products")
                    return True, data["products"]
                else:
                    self.log_result("Get Products", False, f"Invalid response format: {data}")
            else:
                self.log_result("Get Products", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Get Products", False, f"Exception: {str(e)}")
        return False, []

    def test_admin_login(self):
        """Test admin login with correct password"""
        try:
            data = {"password": "admin123"}
            response = requests.post(f"{self.base_url}/api/admin/login", data=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "access_token" in result:
                    self.token = result["access_token"]
                    self.log_result("Admin Login", True)
                    return True
                else:
                    self.log_result("Admin Login", False, f"No token in response: {result}")
            else:
                self.log_result("Admin Login", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception: {str(e)}")
        return False

    def test_admin_login_invalid(self):
        """Test admin login with wrong password"""
        try:
            data = {"password": "wrongpassword"}
            response = requests.post(f"{self.base_url}/api/admin/login", data=data, timeout=10)
            if response.status_code == 401:
                self.log_result("Admin Login (Invalid Password)", True)
                return True
            else:
                self.log_result("Admin Login (Invalid Password)", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_result("Admin Login (Invalid Password)", False, f"Exception: {str(e)}")
        return False

    def test_admin_verify(self):
        """Test admin token verification"""
        if not self.token:
            self.log_result("Admin Verify", False, "No token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/api/admin/verify", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("valid") is True and data.get("role") == "admin":
                    self.log_result("Admin Verify", True)
                    return True
                else:
                    self.log_result("Admin Verify", False, f"Invalid response: {data}")
            else:
                self.log_result("Admin Verify", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Admin Verify", False, f"Exception: {str(e)}")
        return False

    def test_create_product(self):
        """Test creating a product (admin only)"""
        if not self.token:
            self.log_result("Create Product", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Prepare form data
            files = {
                'product_name': (None, 'Test Vitamin C Serum'),
                'description': (None, 'A powerful antioxidant serum for glowing skin'),
                'price': (None, '999.99'),
                'category': (None, 'Skincare'),
                'product_image': ('test.jpg', b'fake_image_data', 'image/jpeg')
            }
            
            response = requests.post(f"{self.base_url}/api/admin/products", 
                                   files=files, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "product" in data and "id" in data["product"]:
                    self.created_product_id = data["product"]["id"]
                    self.log_result("Create Product", True, f"Created product ID: {self.created_product_id}")
                    return True
                else:
                    self.log_result("Create Product", False, f"Invalid response format: {data}")
            else:
                self.log_result("Create Product", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Create Product", False, f"Exception: {str(e)}")
        return False

    def test_get_single_product(self):
        """Test getting a single product by ID"""
        if not self.created_product_id:
            self.log_result("Get Single Product", False, "No product ID available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/api/products/{self.created_product_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.created_product_id:
                    self.log_result("Get Single Product", True)
                    return True
                else:
                    self.log_result("Get Single Product", False, f"ID mismatch: {data}")
            else:
                self.log_result("Get Single Product", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Get Single Product", False, f"Exception: {str(e)}")
        return False

    def test_update_product(self):
        """Test updating a product"""
        if not self.token or not self.created_product_id:
            self.log_result("Update Product", False, "No token or product ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            files = {
                'product_name': (None, 'Updated Test Serum'),
                'description': (None, 'Updated powerful serum description'),
                'price': (None, '1299.99'),
                'category': (None, 'Skincare')
            }
            
            response = requests.put(f"{self.base_url}/api/admin/products/{self.created_product_id}", 
                                  files=files, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "product" in data:
                    self.log_result("Update Product", True)
                    return True
                else:
                    self.log_result("Update Product", False, f"Invalid response: {data}")
            else:
                self.log_result("Update Product", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Update Product", False, f"Exception: {str(e)}")
        return False

    def test_delete_product(self):
        """Test deleting a product"""
        if not self.token or not self.created_product_id:
            self.log_result("Delete Product", False, "No token or product ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.delete(f"{self.base_url}/api/admin/products/{self.created_product_id}", 
                                     headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Delete Product", True)
                    return True
                else:
                    self.log_result("Delete Product", False, f"Invalid response: {data}")
            else:
                self.log_result("Delete Product", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Delete Product", False, f"Exception: {str(e)}")
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🔍 Starting GlowCare Backend API Testing...")
        print(f"🌐 Testing API at: {self.base_url}")
        print("-" * 60)
        
        # Basic API tests
        self.test_health_check()
        self.test_get_categories()
        success, products = self.test_get_products()
        
        # Authentication tests
        self.test_admin_login_invalid()
        self.test_admin_login()
        self.test_admin_verify()
        
        # Product CRUD tests (only if login worked)
        if self.token:
            self.test_create_product()
            self.test_get_single_product()
            self.test_update_product()
            self.test_delete_product()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for fail in self.failed_tests:
                print(f"   • {fail['test']}: {fail['details']}")
        
        return self.tests_passed == self.tests_run, {
            "total": self.tests_run,
            "passed": self.tests_passed,
            "failed": len(self.failed_tests),
            "failed_tests": self.failed_tests
        }

def main():
    tester = GlowCareAPITester()
    all_passed, results = tester.run_all_tests()
    
    # Save results for reporting
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())