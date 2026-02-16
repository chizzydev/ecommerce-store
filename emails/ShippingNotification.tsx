import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface ShippingNotificationEmailProps {
  customerName: string
  orderNumber: string
  trackingNumber: string
  trackingUrl?: string
}

export default function ShippingNotificationEmail({
  customerName = 'Customer',
  orderNumber = 'ORD-12345',
  trackingNumber = 'TRACK123456',
  trackingUrl,
}: ShippingNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order has shipped - {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your order is on the way! 📦</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Great news! Your order has been shipped and is on its way to you.
          </Text>

          <Section style={infoSection}>
            <Text style={infoText}>
              <strong>Order Number:</strong> {orderNumber}
            </Text>
            <Text style={infoText}>
              <strong>Tracking Number:</strong> {trackingNumber}
            </Text>
          </Section>

          <Hr style={hr} />

          {trackingUrl ? (
            <Button style={button} href={trackingUrl}>
              Track Your Package
            </Button>
          ) : (
            <Text style={text}>
              You can track your package using the tracking number above.
            </Text>
          )}

          <Text style={footer}>
            Estimated delivery: 3-5 business days
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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const infoSection = {
  padding: '0 40px',
  margin: '24px 0',
}

const infoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
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