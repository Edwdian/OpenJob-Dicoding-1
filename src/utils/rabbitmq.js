require('dotenv').config();
const amqp = require('amqplib');

const QUEUE_NAME = 'application_notifications';

const getConnectionUrl = () => {
  const { RABBITMQ_USER, RABBITMQ_PASSWORD, RABBITMQ_HOST, RABBITMQ_PORT } = process.env;
  return `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
};

const publishApplication = async (applicationId) => {
  let connection;
  try {
    connection = await amqp.connect(getConnectionUrl());
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify({ application_id: applicationId })),
      { persistent: true }
    );
    await channel.close();
  } catch (err) {
    console.error('RabbitMQ publish error:', err.message);
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
};

module.exports = { publishApplication, QUEUE_NAME, getConnectionUrl };
