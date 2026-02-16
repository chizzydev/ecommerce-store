import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
  customerName: string
  orderNumber: string
  orderDate: string
  orderTotal: string
  items: Array<{
    name: string
    quantity: number
    price: string
  }>
  shippingAddress: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export default function OrderConfirmationEmail({
  customerName = 'Customer',
  orderNumber = 'ORD-12345',
  orderDate = 'January 1, 2024',
  orderTotal = '$99.99',
  items = [],
  shippingAddress = {
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'US',
  },
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Order Confirmation - {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank you for your order!</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            We've received your order and will notify you when it ships.
          </Text>

          <Section style={orderInfo}>
            <Text style={orderInfoText}>
              <strong>Order Number:</strong> {orderNumber}
            </Text>
            <Text style={orderInfoText}>
              <strong>Order Date:</strong> {orderDate}
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Order Details</Heading>
          {items.map((item, index) => (
            <Section key={index} style={itemSection}>
              <Text style={itemName}>{item.name}</Text>
              <Text style={itemDetails}>
                Quantity: {item.quantity} × {item.price}
              </Text>
            </Section>
          ))}

          <Hr style={hr} />

          <Section style={totalSection}>
            <Text style={totalText}>
              <strong>Total:</strong> {orderTotal}
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Shipping Address</Heading>
          <Text style={text}>
            {shippingAddress.address}
            <br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
            <br />
            {shippingAddress.country}
          </Text>

          <Hr style={hr} />

          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/orders`}>
            View Order Status
          </Button>

          <Text style={footer}>
            If you have any questions, please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
}

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const orderInfo = {
  padding: '0 40px',
}

const orderInfoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const itemSection = {
  padding: '0 40px',
  marginBottom: '16px',
}

const itemName = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const itemDetails = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
}

const totalSection = {
  padding: '0 40px',
}

const totalText = {
  color: '#333',
  fontSize: '18px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
  margin: '24px auto',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
}