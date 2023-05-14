const amqp = require('amqplib');

class RabbitMQ {
  constructor(url) {
    if (!RabbitMQ.instance) {
      this.url = url;
      RabbitMQ.instance = this;
    }

    return RabbitMQ.instance;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      console.log('Connected to RabbitMQ!');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async consume(queue, callback) {
    try {
      const channel = await this.connection.createChannel();
      await channel.assertQueue(queue);
      await channel.consume(queue, callback, { noAck: true });
      console.log(`Consuming messages from queue: ${queue}`);
    } catch (error) {
      console.error(`Error consuming messages from queue: ${queue}`, error);
      throw error;
    }
  }

  async publishToExchange(exchange, routingKey, message) {
    try {
      const channel = await this.connection.createChannel();
      await channel.assertExchange(exchange, 'direct', { durable: false });
      await channel.publish(exchange, routingKey, Buffer.from(message));
      console.log(
        `Published message to exchange ${exchange} with routing key ${routingKey}: ${message}`
      );
    } catch (error) {
      console.error(
        `Error publishing message to exchange ${exchange} with routing key ${routingKey}`,
        error
      );
      throw error;
    }
  }
}

module.exports = RabbitMQ;
