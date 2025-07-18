const amqp = require('amqplib');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const username = process.env.RABBITMQ_USERNAME || 'guest';
    const password = process.env.RABBITMQ_PASSWORD || 'guest';

    const connectionString = url.replace('amqp://', `amqp://${username}:${password}@`);

    connection = await amqp.connect(connectionString);
    channel = await connection.createChannel();

    console.log('✅ RabbitMQ Connected');

    // Handle connection events
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('⚠️ RabbitMQ connection closed');
    });

    // Create queues
    await createQueues();

  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error.message);
    // Don't exit process for RabbitMQ failure, app can work without queuing
  }
};

const createQueues = async () => {
  try {
    if (!channel) return;

    // Inventory update queue
    await channel.assertQueue('inventory-updates', {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000 // 24 hours
      }
    });

    // Email notifications queue
    await channel.assertQueue('email-notifications', {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000 // 24 hours
      }
    });

    // Low stock alerts queue
    await channel.assertQueue('low-stock-alerts', {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000 // 24 hours
      }
    });

    console.log('✅ RabbitMQ queues created');

  } catch (error) {
    console.error('❌ Failed to create RabbitMQ queues:', error);
  }
};

const sendToQueue = async (queueName, data) => {
  try {
    if (!channel) {
      console.warn('⚠️ RabbitMQ not connected, skipping message');
      return false;
    }

    const message = JSON.stringify({
      timestamp: new Date().toISOString(),
      data: data
    });

    await channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true
    });

    console.log(`📤 Message sent to queue: ${queueName}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send message to queue ${queueName}:`, error);
    return false;
  }
};

const consumeQueue = async (queueName, callback) => {
  try {
    if (!channel) {
      console.warn('⚠️ RabbitMQ not connected, cannot consume messages');
      return false;
    }

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          console.error(`❌ Error processing message from ${queueName}:`, error);
          channel.nack(msg, false, false);
        }
      }
    });

    console.log(`📥 Started consuming queue: ${queueName}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to consume queue ${queueName}:`, error);
    return false;
  }
};

const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log('✅ RabbitMQ connection closed');
  } catch (error) {
    console.error('❌ Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  consumeQueue,
  closeConnection
}; 