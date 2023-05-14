require('dotenv');
const express = require('express');
const RabbitMQ = require('./RabbitMQ');

const app = express();
const rabbitMQ = new RabbitMQ(process.env.AMQP_URI);

app.use(express.json());

app.get('/messages/consume/json', async (req, res) => {
  try {
    let reply = null;
    const { queue } = req.query;

    await rabbitMQ.connect();
    await rabbitMQ.consume(queue, (message) => {
      console.log(`Received message: ${message.content.toString()}`);
      reply = JSON.stringify(message.content.toString());
    });

    res.status(200).json({ success: true, data: reply });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error consuming messages' });
  }
});

app.post('/messages/publish', async (req, res) => {
  try {
    const { exchange, routingKey, message } = req.body;

    await rabbitMQ.connect();
    await rabbitMQ.publishToExchange(
      exchange,
      routingKey,
      JSON.stringify(message)
    );

    res.status(201).json({
      success: true,
      message: `Published message to exchange ${exchange} with routing key ${routingKey}: ${JSON.stringify(
        message
      )}`,
    });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error publishing message' });
  }
});

app.listen(3000, () => {
  console.log('Express app listening on port 3000');
});
