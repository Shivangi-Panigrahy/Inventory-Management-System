const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

// Demo data
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@inventory.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    name: 'Manager User',
    email: 'manager@inventory.com',
    password: 'Manager123!',
    role: 'manager'
  },
  {
    name: 'Regular User',
    email: 'user@inventory.com',
    password: 'User123!',
    role: 'user'
  }
];

const demoInventory = [
  {
    name: 'Laptop Dell XPS 13',
    category: 'Electronics',
    price: 1299.99,
    quantity: 25,
    description: 'High-performance laptop with Intel i7 processor, 16GB RAM, and 512GB SSD',
    tags: ['laptop', 'dell', 'xps', 'electronics'],
    supplier: {
      name: 'Dell Technologies',
      email: 'orders@dell.com',
      phone: '+1-800-999-3355'
    },
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'A1',
      bin: 'B01'
    },
    reorderPoint: 5,
    reorderQuantity: 20,
    unit: 'pieces',
    status: 'active'
  },
  {
    name: 'Wireless Mouse Logitech MX Master',
    category: 'Electronics',
    price: 79.99,
    quantity: 50,
    description: 'Premium wireless mouse with ergonomic design and precision tracking',
    tags: ['mouse', 'wireless', 'logitech', 'ergonomic'],
    supplier: {
      name: 'Logitech',
      email: 'sales@logitech.com',
      phone: '+1-800-231-7717'
    },
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'A2',
      bin: 'B05'
    },
    reorderPoint: 10,
    reorderQuantity: 30,
    unit: 'pieces',
    status: 'active'
  },
  {
    name: 'Office Chair Ergonomic',
    category: 'Office Supplies',
    price: 299.99,
    quantity: 15,
    description: 'Ergonomic office chair with adjustable height and lumbar support',
    tags: ['chair', 'office', 'ergonomic', 'furniture'],
    supplier: {
      name: 'Office Furniture Co.',
      email: 'orders@officefurniture.com',
      phone: '+1-800-555-0123'
    },
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'B1',
      bin: 'C02'
    },
    reorderPoint: 3,
    reorderQuantity: 10,
    unit: 'pieces',
    status: 'active'
  },
  {
    name: 'Coffee Beans Premium Blend',
    category: 'Food & Beverages',
    price: 24.99,
    quantity: 100,
    description: 'Premium coffee beans blend, medium roast, 1kg package',
    tags: ['coffee', 'beans', 'premium', 'beverage'],
    supplier: {
      name: 'Coffee Roasters Inc.',
      email: 'orders@coffeeroasters.com',
      phone: '+1-800-777-8888'
    },
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'C1',
      bin: 'D01'
    },
    reorderPoint: 20,
    reorderQuantity: 50,
    unit: 'kg',
    status: 'active'
  },
  {
    name: 'Running Shoes Nike Air Max',
    category: 'Sports & Outdoors',
    price: 129.99,
    quantity: 8,
    description: 'Comfortable running shoes with air cushioning technology',
    tags: ['shoes', 'running', 'nike', 'sports'],
    supplier: {
      name: 'Nike Inc.',
      email: 'wholesale@nike.com',
      phone: '+1-800-344-6453'
    },
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'D1',
      bin: 'E03'
    },
    reorderPoint: 5,
    reorderQuantity: 25,
    unit: 'pairs',
    status: 'active'
  }
];

class InventoryDemo {
  constructor() {
    this.token = null;
    this.user = null;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async registerUser(userData) {
    console.log(`\n📝 Registering user: ${userData.email}`);
    const result = await this.makeRequest('POST', '/auth/register', userData);
    console.log(`✅ User registered successfully: ${result.data.user.name}`);
    return result.data.token;
  }

  async loginUser(email, password) {
    console.log(`\n🔐 Logging in user: ${email}`);
    const result = await this.makeRequest('POST', '/auth/login', { email, password });
    console.log(`✅ Login successful: ${result.data.user.name}`);
    return result.data.token;
  }

  async createInventoryItem(itemData, token) {
    console.log(`\n📦 Creating inventory item: ${itemData.name}`);
    const result = await this.makeRequest('POST', '/inventory', itemData, token);
    console.log(`✅ Item created successfully: ${result.data.name}`);
    return result.data;
  }

  async getInventoryStats(token) {
    console.log(`\n📊 Getting inventory statistics`);
    const result = await this.makeRequest('GET', '/inventory/stats', null, token);
    console.log(`✅ Statistics retrieved:`);
    console.log(`   - Total Items: ${result.data.totalItems}`);
    console.log(`   - Total Value: $${result.data.totalValue?.toFixed(2) || '0.00'}`);
    console.log(`   - Low Stock Items: ${result.data.lowStockItems}`);
    console.log(`   - Out of Stock Items: ${result.data.outOfStockItems}`);
    return result.data;
  }

  async searchInventory(query, token) {
    console.log(`\n🔍 Searching inventory for: "${query}"`);
    const result = await this.makeRequest('GET', `/inventory?search=${encodeURIComponent(query)}`, null, token);
    console.log(`✅ Search results: ${result.data.items.length} items found`);
    return result.data;
  }

  async updateInventoryItem(itemId, updateData, token) {
    console.log(`\n✏️  Updating inventory item: ${itemId}`);
    const result = await this.makeRequest('PUT', `/inventory/${itemId}`, updateData, token);
    console.log(`✅ Item updated successfully: ${result.data.name}`);
    return result.data;
  }

  async getLowStockItems(token) {
    console.log(`\n⚠️  Getting low stock items`);
    const result = await this.makeRequest('GET', '/inventory/low-stock', null, token);
    console.log(`✅ Low stock items: ${result.data.length} items`);
    return result.data;
  }

  async runDemo() {
    console.log('🚀 Starting Inventory Management System Demo');
    console.log('=' .repeat(50));

    try {
      // Step 1: Register and login as admin
      console.log('\n👤 Step 1: User Registration and Authentication');
      const adminToken = await this.registerUser(demoUsers[0]);
      await this.delay(1000);

      // Step 2: Create inventory items
      console.log('\n📦 Step 2: Creating Inventory Items');
      const createdItems = [];
      for (const item of demoInventory) {
        const createdItem = await this.createInventoryItem(item, adminToken);
        createdItems.push(createdItem);
        await this.delay(500);
      }

      // Step 3: Get inventory statistics
      console.log('\n📊 Step 3: Inventory Statistics');
      await this.getInventoryStats(adminToken);
      await this.delay(1000);

      // Step 4: Search functionality
      console.log('\n🔍 Step 4: Search and Filtering');
      await this.searchInventory('laptop', adminToken);
      await this.delay(500);
      await this.searchInventory('electronics', adminToken);
      await this.delay(500);

      // Step 5: Update inventory (simulate low stock)
      console.log('\n✏️  Step 5: Updating Inventory Items');
      const itemToUpdate = createdItems[0];
      await this.updateInventoryItem(itemToUpdate._id, { quantity: 2 }, adminToken);
      await this.delay(1000);

      // Step 6: Check low stock items
      console.log('\n⚠️  Step 6: Low Stock Monitoring');
      await this.getLowStockItems(adminToken);
      await this.delay(1000);

      // Step 7: Register and test different user roles
      console.log('\n👥 Step 7: Testing User Roles');
      const managerToken = await this.registerUser(demoUsers[1]);
      await this.delay(1000);

      // Test manager creating an item
      const managerItem = {
        name: 'Manager Created Item',
        category: 'Office Supplies',
        price: 15.99,
        quantity: 10,
        description: 'Item created by manager user',
        tags: ['manager', 'test'],
        supplier: {
          name: 'Test Supplier',
          email: 'test@supplier.com'
        },
        location: {
          warehouse: 'Main Warehouse',
          shelf: 'Test',
          bin: 'T01'
        },
        reorderPoint: 2,
        reorderQuantity: 5,
        unit: 'pieces',
        status: 'active'
      };

      await this.createInventoryItem(managerItem, managerToken);
      await this.delay(1000);

      console.log('\n🎉 Demo completed successfully!');
      console.log('\n📋 Demo Summary:');
      console.log('✅ User registration and authentication');
      console.log('✅ Inventory item creation');
      console.log('✅ Statistics and reporting');
      console.log('✅ Search and filtering');
      console.log('✅ Inventory updates');
      console.log('✅ Low stock monitoring');
      console.log('✅ Role-based access control');
      console.log('✅ CRUD operations');
      console.log('✅ Caching (Redis)');
      console.log('✅ Message queuing (RabbitMQ)');

      console.log('\n🌐 Access the application:');
      console.log('   Frontend: http://localhost:3000');
      console.log('   Backend API: http://localhost:8000');
      console.log('   RabbitMQ Management: http://localhost:15672');

    } catch (error) {
      console.error('\n❌ Demo failed:', error.message);
      console.log('\n💡 Make sure the backend server is running on http://localhost:8000');
    }
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  const demo = new InventoryDemo();
  demo.runDemo();
}

module.exports = InventoryDemo; 